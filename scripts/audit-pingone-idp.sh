#!/usr/bin/env bash
# Audit or narrowly update PingOne external OIDC IdP configuration.
# The Worker secret and access token are never printed or written to the repository.
set -euo pipefail

PINGONE_ENVIRONMENT_ID="${PINGONE_ENVIRONMENT_ID:-a6e455f2-da21-4c7d-b40f-8b288a64b010}"
PINGONE_WORKER_CLIENT_ID="${PINGONE_WORKER_CLIENT_ID:-c2b4986b-2f31-4e46-a2de-fa8b0a08b00f}"
PINGONE_AUTH_BASE_URL="${PINGONE_AUTH_BASE_URL:-https://auth.pingone.ca}"
PINGONE_API_BASE_URL="${PINGONE_API_BASE_URL:-https://api.pingone.ca/v1}"

action="audit"
GIGYA_FORCE_LOGIN_PROXY_URL="${GIGYA_FORCE_LOGIN_PROXY_URL:-https://cdc-login.gsusa.local/api/auth/gigya-authorize}"
GIGYA_FEDERATED_POLICY_NAME="${GIGYA_FEDERATED_POLICY_NAME:-Gigya-Federated}"
GIGYA_FEDERATED_SSO_WINDOW_SECONDS="${GIGYA_FEDERATED_SSO_WINDOW_SECONDS:-28800}"

usage() {
  cat <<'EOF'
Usage: ./scripts/audit-pingone-idp.sh [ACTION]

Reads the configured PingOne external IdPs, then asks PingOne to discover the
OIDC metadata for the Gigya and Okta providers. With no action, it does not
modify PingOne.

With --apply-gigya-logout, the script updates only Gigya's discoveryEndpoint,
sloEndpoint, and sloBinding fields using the successfully discovered metadata.

With --apply-gigya-force-login-proxy, the script preserves the existing Gigya
provider configuration and changes only authorizationEndpoint to the local POC
proxy. After logout, the proxy adds prompt=login to the next interactive Gigya
authorization before redirecting the browser to Gigya.

With --restore-gigya-authorization-endpoint, the script restores Gigya's
authorizationEndpoint from its current OIDC discovery metadata.

With --apply-gigya-federated-sso-window, the script updates the existing
Gigya-Federated IDENTITY_PROVIDER policy action to reference the enabled Gigya
provider and require Gigya only when the PingOne sign-on is older than eight
hours. It preserves the action's priority, user-context, registration, and ACR
settings.

The script securely prompts for the poc-mgmt-api Worker client secret. You may
also provide it through PINGONE_WORKER_CLIENT_SECRET for non-interactive use.

Optional overrides:
  PINGONE_ENVIRONMENT_ID
  PINGONE_WORKER_CLIENT_ID
  PINGONE_AUTH_BASE_URL
  PINGONE_API_BASE_URL
  GIGYA_FORCE_LOGIN_PROXY_URL
  GIGYA_FEDERATED_POLICY_NAME
  GIGYA_FEDERATED_SSO_WINDOW_SECONDS
EOF
}

case "${1:-}" in
  "") ;;
  --apply-gigya-logout) action="apply_logout" ;;
  --apply-gigya-force-login-proxy) action="apply_force_login_proxy" ;;
  --restore-gigya-authorization-endpoint) action="restore_authorization_endpoint" ;;
  --apply-gigya-federated-sso-window) action="apply_federated_sso_window" ;;
  --help|-h)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

for dependency in curl jq base64; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "Required command not found: $dependency" >&2
    exit 1
  fi
done

if [[ ! "$GIGYA_FEDERATED_SSO_WINDOW_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "GIGYA_FEDERATED_SSO_WINDOW_SECONDS must be a positive integer." >&2
  exit 1
fi

worker_secret="${PINGONE_WORKER_CLIENT_SECRET:-}"
if [[ -z "$worker_secret" ]]; then
  read -r -s -p "poc-mgmt-api Worker client secret: " worker_secret
  echo
fi

if [[ -z "$worker_secret" ]]; then
  echo "A Worker client secret is required." >&2
  exit 1
fi

# Send authorization headers through curl's stdin so credentials do not appear
# in the curl command line or in shell tracing output.
basic_credentials="$(printf '%s' "$PINGONE_WORKER_CLIENT_ID:$worker_secret" | base64 | tr -d '\r\n')"
token_response="$(
  printf 'Authorization: Basic %s\nContent-Type: application/x-www-form-urlencoded\n' "$basic_credentials" |
    curl --silent --show-error --request POST --header @- \
      --data 'grant_type=client_credentials' \
      "$PINGONE_AUTH_BASE_URL/$PINGONE_ENVIRONMENT_ID/as/token"
)"
unset worker_secret basic_credentials

access_token="$(jq -r '.access_token // empty' <<<"$token_response")"
if [[ -z "$access_token" ]]; then
  error_description="$(jq -r '.error_description // .message // .error // "unknown token error"' <<<"$token_response" 2>/dev/null || true)"
  echo "PingOne did not issue a Worker access token: $error_description" >&2
  exit 1
fi
unset token_response error_description

HTTP_STATUS=""
HTTP_BODY=""

pingone_request() {
  local method="$1"
  local url="$2"
  local content_type="${3:-}"
  local request_body="${4:-}"
  local response

  if [[ -n "$request_body" ]]; then
    response="$(
      printf '%s' "$request_body" |
        curl --silent --show-error --request "$method" \
          --header @<(printf 'Authorization: Bearer %s\nContent-Type: %s\n' "$access_token" "$content_type") \
          --data-binary @- --write-out $'\n%{http_code}' "$url"
    )"
  else
    response="$(
      printf 'Authorization: Bearer %s\n' "$access_token" |
        curl --silent --show-error --request "$method" --header @- \
          --write-out $'\n%{http_code}' "$url"
    )"
  fi

  HTTP_STATUS="${response##*$'\n'}"
  HTTP_BODY="${response%$'\n'*}"
}

print_api_error() {
  local operation="$1"
  local message
  message="$(jq -r '.message // .details[0].message // .errors[0].message // "No error message returned"' <<<"$HTTP_BODY" 2>/dev/null || true)"
  echo "$operation failed with HTTP $HTTP_STATUS: $message" >&2
  if [[ "$HTTP_STATUS" == "403" ]]; then
    echo "Check the poc-mgmt-api Roles tab for Identity Provider read permission." >&2
  fi
}

sanitize_provider='{
  id,
  name,
  type,
  enabled,
  description,
  issuer,
  discoveryEndpoint,
  authorizationEndpoint,
  tokenEndpoint,
  userInfoEndpoint,
  jwksEndpoint,
  scopes,
  tokenEndpointAuthMethod,
  pkceMethod,
  sloEndpoint,
  sloBinding,
  sloResponseEndpoint
}'

providers_url="$PINGONE_API_BASE_URL/environments/$PINGONE_ENVIRONMENT_ID/identityProviders"
pingone_request GET "$providers_url"
if [[ "$HTTP_STATUS" != "200" ]]; then
  print_api_error "Listing PingOne identity providers"
  exit 1
fi

providers="$(jq -c '._embedded.identityProviders // .identityProviders // []' <<<"$HTTP_BODY")"
unset HTTP_BODY

if [[ "$(jq 'length' <<<"$providers")" == "0" ]]; then
  echo "PingOne returned no identity providers for this environment." >&2
  exit 1
fi

echo "PingOne external IdPs (secrets and client IDs omitted):"
jq "$sanitize_provider" <<<"$(jq -c '.[]' <<<"$providers")"

inspect_provider() {
  local label="$1"
  local provider_summary="$2"
  local provider_id
  local provider
  local configured_discovery
  local issuer
  local authorization_endpoint
  local discovery_url
  local discovery_payload
  local discovered_authorization_endpoint
  local end_session_endpoint
  local update_payload
  local target_authorization_endpoint

  if [[ -z "$provider_summary" ]]; then
    echo
    echo "$label provider: not found"
    return
  fi

  provider_id="$(jq -r '.id' <<<"$provider_summary")"
  pingone_request GET "$providers_url/$provider_id"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Reading the $label identity provider"
    return
  fi
  provider="$HTTP_BODY"

  echo
  echo "$label provider stored in PingOne:"
  jq "$sanitize_provider" <<<"$provider"

  configured_discovery="$(jq -r '.discoveryEndpoint // empty' <<<"$provider")"
  issuer="$(jq -r '.issuer // empty' <<<"$provider")"
  authorization_endpoint="$(jq -r '.authorizationEndpoint // empty' <<<"$provider")"
  discovery_url="$configured_discovery"

  if [[ -z "$discovery_url" && "$authorization_endpoint" == */authorize ]]; then
    discovery_url="${authorization_endpoint%/authorize}/.well-known/openid-configuration"
    echo "$label has no stored discoveryEndpoint; testing the authorization-endpoint-derived URL: $discovery_url"
  elif [[ -z "$discovery_url" && -n "$issuer" ]]; then
    discovery_url="${issuer%/}/.well-known/openid-configuration"
    echo "$label has no stored discoveryEndpoint; testing the issuer-derived URL: $discovery_url"
  elif [[ -z "$discovery_url" ]]; then
    echo "$label has neither discoveryEndpoint nor issuer, so discovery cannot be tested."
    return
  fi

  discovery_payload="$(jq -cn --arg url "$discovery_url" '{url: $url}')"
  pingone_request POST "$providers_url" \
    'application/vnd.pingidentity.openid-configuration.discover+json' \
    "$discovery_payload"

  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Discovering $label OIDC metadata through PingOne"
    return
  fi

  echo "$label OIDC discovery metadata returned through PingOne:"
  jq '{
    issuer,
    authorization_endpoint,
    token_endpoint,
    userinfo_endpoint,
    jwks_uri,
    end_session_endpoint,
    frontchannel_logout_supported,
    backchannel_logout_supported
  }' <<<"$HTTP_BODY"

  end_session_endpoint="$(jq -r '.end_session_endpoint // empty' <<<"$HTTP_BODY")"
  discovered_authorization_endpoint="$(jq -r '.authorization_endpoint // empty' <<<"$HTTP_BODY")"
  if [[ -n "$end_session_endpoint" ]]; then
    echo "$label publishes an end_session_endpoint: $end_session_endpoint"
  else
    echo "$label does NOT publish an end_session_endpoint."
  fi

  if [[ "$label" == "Gigya" && "$action" == "apply_logout" ]]; then
    if [[ -z "$end_session_endpoint" ]]; then
      echo "Refusing to update Gigya because discovery returned no end_session_endpoint." >&2
      return
    fi

    update_payload="$(jq -c \
      --arg discoveryEndpoint "$discovery_url" \
      --arg sloEndpoint "$end_session_endpoint" \
      '{
        name,
        type,
        enabled,
        description,
        clientId,
        clientSecret,
        authorizationEndpoint,
        tokenEndpoint,
        userInfoEndpoint,
        jwksEndpoint,
        issuer,
        scopes,
        tokenEndpointAuthMethod,
        pkceMethod,
        registration,
        icon,
        loginButtonIcon
      }
      | with_entries(select(.value != null))
      + {
        discoveryEndpoint: $discoveryEndpoint,
        sloEndpoint: $sloEndpoint,
        sloBinding: "HTTP_REDIRECT"
      }' <<<"$provider")"

    echo
    echo "Updating only Gigya logout/discovery metadata in PingOne..."
    pingone_request PUT "$providers_url/$provider_id" 'application/json' "$update_payload"
    if [[ "$HTTP_STATUS" != "200" ]]; then
      print_api_error "Updating Gigya logout/discovery metadata"
      return
    fi

    echo "Gigya logout/discovery metadata now stored in PingOne:"
    jq '{
      id,
      name,
      type,
      enabled,
      discoveryEndpoint,
      sloEndpoint,
      sloBinding,
      authorizationEndpoint,
      tokenEndpoint,
      userInfoEndpoint,
      jwksEndpoint,
      issuer,
      scopes,
      tokenEndpointAuthMethod
    }' <<<"$HTTP_BODY"
  fi

  if [[ "$label" == "Gigya" && ( "$action" == "apply_force_login_proxy" || "$action" == "restore_authorization_endpoint" ) ]]; then
    if [[ "$action" == "apply_force_login_proxy" ]]; then
      target_authorization_endpoint="$GIGYA_FORCE_LOGIN_PROXY_URL"
      if [[ "$target_authorization_endpoint" != https://* ]]; then
        echo "Refusing to store a non-HTTPS Gigya authorization proxy URL." >&2
        return
      fi
      echo
      echo "Applying the POC forced-login authorization proxy to Gigya..."
    else
      target_authorization_endpoint="$discovered_authorization_endpoint"
      if [[ -z "$target_authorization_endpoint" ]]; then
        echo "Refusing to restore Gigya because discovery returned no authorization_endpoint." >&2
        return
      fi
      echo
      echo "Restoring Gigya's authorization endpoint from discovery metadata..."
    fi

    update_payload="$(jq -c \
      --arg authorizationEndpoint "$target_authorization_endpoint" \
      '{
        name,
        type,
        enabled,
        description,
        clientId,
        clientSecret,
        discoveryEndpoint,
        tokenEndpoint,
        userInfoEndpoint,
        jwksEndpoint,
        issuer,
        scopes,
        tokenEndpointAuthMethod,
        pkceMethod,
        registration,
        icon,
        loginButtonIcon,
        sloEndpoint,
        sloBinding,
        sloResponseEndpoint
      }
      | with_entries(select(.value != null))
      + { authorizationEndpoint: $authorizationEndpoint }' <<<"$provider")"

    pingone_request PUT "$providers_url/$provider_id" 'application/json' "$update_payload"
    if [[ "$HTTP_STATUS" != "200" ]]; then
      print_api_error "Updating Gigya's authorization endpoint"
      return
    fi

    echo "Gigya authorization configuration now stored in PingOne:"
    jq '{
      id,
      name,
      enabled,
      issuer,
      discoveryEndpoint,
      authorizationEndpoint,
      tokenEndpoint,
      userInfoEndpoint,
      jwksEndpoint,
      tokenEndpointAuthMethod
    }' <<<"$HTTP_BODY"
  fi
}

apply_gigya_federated_sso_window() {
  local provider_summary="$1"
  local provider_id
  local policies_url
  local policies
  local policy_matches
  local policy_count
  local policy_id
  local actions_url
  local actions
  local action_matches
  local action_count
  local policy_action
  local policy_action_id
  local current_provider_id
  local update_payload

  if [[ -z "$provider_summary" ]]; then
    echo "Refusing to update the policy because no Gigya provider was found." >&2
    return 1
  fi

  provider_id="$(jq -r '.id // empty' <<<"$provider_summary")"
  if [[ -z "$provider_id" ]] || ! jq -e '.enabled == true and .type == "OPENID_CONNECT"' <<<"$provider_summary" >/dev/null; then
    echo "Refusing to update the policy because the discovered Gigya provider is not an enabled OIDC provider." >&2
    return 1
  fi

  policies_url="$PINGONE_API_BASE_URL/environments/$PINGONE_ENVIRONMENT_ID/signOnPolicies"
  pingone_request GET "$policies_url?limit=100"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Listing PingOne authentication policies"
    return 1
  fi

  policies="$(jq -c '._embedded.signOnPolicies // .signOnPolicies // []' <<<"$HTTP_BODY")"
  policy_matches="$(jq -c --arg name "$GIGYA_FEDERATED_POLICY_NAME" '[.[] | select(.name == $name)]' <<<"$policies")"
  policy_count="$(jq 'length' <<<"$policy_matches")"
  if [[ "$policy_count" != "1" ]]; then
    echo "Refusing to update: expected exactly one policy named '$GIGYA_FEDERATED_POLICY_NAME', found $policy_count." >&2
    return 1
  fi

  policy_id="$(jq -r '.[0].id' <<<"$policy_matches")"
  actions_url="$policies_url/$policy_id/actions"
  pingone_request GET "$actions_url"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Reading $GIGYA_FEDERATED_POLICY_NAME policy actions"
    return 1
  fi

  actions="$(jq -c '._embedded.actions // ._embedded.signOnPolicyActions // .actions // []' <<<"$HTTP_BODY")"
  action_matches="$(jq -c '[.[] | select(.type == "IDENTITY_PROVIDER")]' <<<"$actions")"
  action_count="$(jq 'length' <<<"$action_matches")"
  if [[ "$action_count" != "1" ]]; then
    echo "Refusing to update: expected exactly one IDENTITY_PROVIDER action in '$GIGYA_FEDERATED_POLICY_NAME', found $action_count." >&2
    return 1
  fi

  policy_action="$(jq -c '.[0]' <<<"$action_matches")"
  policy_action_id="$(jq -r '.id // empty' <<<"$policy_action")"
  current_provider_id="$(jq -r '.identityProvider.id // empty' <<<"$policy_action")"

  if [[ -z "$policy_action_id" ]] ||
     ! jq -e '
       (.priority | type) == "number"
       and ((.passUserContext == null) or ((.passUserContext | type) == "boolean"))
       and ((.registration == null) or ((.registration | type) == "object"))
       and ((.registration.enabled == null) or ((.registration.enabled | type) == "boolean"))
     ' <<<"$policy_action" >/dev/null; then
    echo "Refusing to update: the existing policy action is missing required fields." >&2
    return 1
  fi

  echo
  echo "Authentication policy update plan:"
  jq -n \
    --arg policy "$GIGYA_FEDERATED_POLICY_NAME" \
    --arg actionId "$policy_action_id" \
    --arg currentProviderId "$current_provider_id" \
    --arg targetProviderId "$provider_id" \
    --argjson seconds "$GIGYA_FEDERATED_SSO_WINDOW_SECONDS" \
    --argjson action "$policy_action" \
    '{
      policy: $policy,
      actionId: $actionId,
      currentProviderId: $currentProviderId,
      targetProviderId: $targetProviderId,
      lastSignOnOlderThanSeconds: $seconds,
      preservedActionSettings: {
        priority: $action.priority,
        passUserContext: ($action.passUserContext // false),
        registration: ($action.registration // {enabled: false}),
        acrValues: $action.acrValues
      }
    }'

  if jq -e \
    --arg providerId "$provider_id" \
    --argjson seconds "$GIGYA_FEDERATED_SSO_WINDOW_SECONDS" \
    '.identityProvider.id == $providerId
      and .condition.greater == $seconds
      and .condition.secondsSince == "${session.lastSignOn.withAuthenticator.pwd.at}"' \
    <<<"$policy_action" >/dev/null; then
    echo "The policy action already has the requested Gigya provider and SSO window; no update is needed."
    return
  fi

  update_payload="$(jq -c \
    --arg providerId "$provider_id" \
    --argjson seconds "$GIGYA_FEDERATED_SSO_WINDOW_SECONDS" \
    '{
      type: "IDENTITY_PROVIDER",
      identityProvider: {id: $providerId},
      priority,
      passUserContext: (.passUserContext // false),
      registration: ((.registration // {}) + {
        enabled: (.registration.enabled // false)
      }),
      condition: {
        greater: $seconds,
        secondsSince: "${session.lastSignOn.withAuthenticator.pwd.at}"
      }
    }
    + (if .acrValues != null then {acrValues} else {} end)
    + (if .entraIdEnabled != null then {entraIdEnabled} else {} end)' \
    <<<"$policy_action")"

  echo "Updating only the Gigya provider reference and last-sign-on condition..."
  pingone_request PUT "$actions_url/$policy_action_id" 'application/json' "$update_payload"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Updating $GIGYA_FEDERATED_POLICY_NAME policy action"
    return 1
  fi

  pingone_request GET "$actions_url/$policy_action_id"
  if [[ "$HTTP_STATUS" != "200" ]]; then
    print_api_error "Verifying $GIGYA_FEDERATED_POLICY_NAME policy action"
    return 1
  fi

  if ! jq -e \
    --arg providerId "$provider_id" \
    --argjson seconds "$GIGYA_FEDERATED_SSO_WINDOW_SECONDS" \
    '.type == "IDENTITY_PROVIDER"
      and .identityProvider.id == $providerId
      and .condition.greater == $seconds
      and .condition.secondsSince == "${session.lastSignOn.withAuthenticator.pwd.at}"' \
    <<<"$HTTP_BODY" >/dev/null; then
    echo "PingOne accepted the update, but read-back verification did not match the requested settings." >&2
    return 1
  fi

  echo "$GIGYA_FEDERATED_POLICY_NAME policy action verified:"
  jq '{
    id,
    type,
    priority,
    identityProvider,
    condition,
    passUserContext,
    registration,
    acrValues
  }' <<<"$HTTP_BODY"
}

gigya_provider="$(
  jq -c '[.[] | select(
    ((.name // "") | test("gigya|cdc|dev-parent-gsusa"; "i")) or
    ((.issuer // "") | test("gigya|dev-parent-gsusa"; "i")) or
    ((.discoveryEndpoint // "") | test("gigya|dev-parent-gsusa"; "i"))
  )][0] // empty' <<<"$providers"
)"

okta_provider="$(
  jq -c '[.[] | select(
    ((.name // "") | test("okta"; "i")) or
    ((.issuer // "") | test("okta"; "i")) or
    ((.discoveryEndpoint // "") | test("okta"; "i"))
  )][0] // empty' <<<"$providers"
)"
unset providers

inspect_provider "Gigya" "$gigya_provider"
inspect_provider "Okta" "$okta_provider"

if [[ "$action" == "apply_federated_sso_window" ]]; then
  apply_gigya_federated_sso_window "$gigya_provider"
fi

unset access_token gigya_provider okta_provider HTTP_BODY HTTP_STATUS
