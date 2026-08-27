/**
 * CIAM Broker PoC — Universal Token Inspector Widget
 *
 * Drop-in script that works with any auth stack (next-auth, oidc-client-ts, etc.)
 * Uses Shadow DOM for complete style isolation from host app.
 *
 * Usage: <script src="/poc-tools/token-inspector.js" defer></script>
 */
(function () {
  "use strict";

  const POLL_INTERVAL = 5000;
  const CLAIM_DESCRIPTIONS = {
    iss: "Issuer — the identity provider or broker that minted this token",
    sub: "Subject — unique user identifier",
    aud: "Audience — the client (app) this token was issued for",
    exp: "Expiration — Unix timestamp when this token expires",
    iat: "Issued At — Unix timestamp when this token was created",
    auth_time: "Authentication Time — when the user actually logged in",
    nonce: "Nonce — random value to prevent replay attacks",
    acr: "Authentication Context Class Reference — level of authentication assurance",
    amr: "Authentication Methods Reference — methods used to authenticate",
    azp: "Authorized Party — the client that requested this token",
    at_hash: "Access Token Hash — binds the ID token to a specific access token",
    jti: "JWT ID — unique identifier for this specific token",
    sid: "Session ID — SSO session identifier (shared across apps)",
    typ: "Token Type — ID, Bearer, etc.",
    scope: "Scopes — the OIDC scopes granted for this session",
    session_state: "Session State — session tracking value",
    realm_access: "Realm Access — roles assigned at the realm level",
    resource_access: "Resource Access — roles assigned per-client",
    name: "Full Name — user's display name",
    given_name: "Given Name — user's first name",
    family_name: "Family Name — user's last name",
    preferred_username: "Preferred Username — typically the user's email or login ID",
    email: "Email — user's email address",
    email_verified: "Email Verified — whether the IdP confirmed this email",
    identity_provider: "Identity Provider — which upstream IdP authenticated this user",
    identity_provider_identity: "IdP Identity — the user's identifier at the upstream IdP",
    upstream_gsUserType: "GS User Type — SAP CDC user classification (data.GSUserType)",
    upstream_councilCode: "Council Code — Girl Scout council identifier (data.GSUSA.COUNCILCODE)",
    upstream_gsGlobalId: "GS Global ID — GSUSA global user identifier (data.GSUSA.GSGLOBALID)",
    upstream_isAdultUser: "Is Adult User — adult vs. girl member flag (data.GSUSA.IsAdultUser)",
    upstream_teamId: "Team ID — troop/team identifier (data.GSUSA.TeamID)",
    upstream_houseHoldId: "Household ID — household identifier (data.houseHoldID)",
    upstream_groups: "Upstream Groups — group memberships from the upstream IdP",
    GSUserType: "GS User Type — SAP CDC user classification",
    COUNCILCODE: "Council Code — Girl Scout council identifier",
    GSGLOBALID: "GS Global ID — GSUSA global user identifier",
    IsAdultUser: "Is Adult User — adult vs. girl member flag",
    TeamID: "Team ID — troop/team identifier",
    houseHoldID: "Household ID — household identifier",
  };

  const CUSTOM_PREFIXES = ["upstream_", "GSUser", "COUNCIL", "GSGLOBAL", "IsAdult", "TeamID", "houseHold"];
  function isCustomClaim(key) {
    return CUSTOM_PREFIXES.some(function (p) { return key.indexOf(p) === 0; }) ||
      typeof key === "string" && key.indexOf("://") > -1;
  }

  function decodeJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    } catch (e) { return null; }
  }

  // --- Data fetching ---

  function fetchNextAuth() {
    return fetch("/api/auth/session", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.user) return null;
        var bc = d.brokerClaims || {};
        return {
          source: "next-auth",
          platform: bc.brokerPlatform || "keycloak",
          idToken: bc.rawIdToken || null,
          accessToken: bc.rawAccessToken || null,
          session: { user: d.user, expires: d.expires, brokerClaims: bc },
        };
      })
      .catch(function () { return null; });
  }

  function fetchOidcClientTs() {
    for (var i = 0; i < sessionStorage.length; i++) {
      var key = sessionStorage.key(i);
      if (key && key.indexOf("oidc.user:") === 0) {
        try {
          var user = JSON.parse(sessionStorage.getItem(key));
          if (!user || !user.id_token) continue;
          var idClaims = decodeJwt(user.id_token);
          var accessClaims = user.access_token ? decodeJwt(user.access_token) : null;
          return {
            source: "oidc-client-ts",
            platform: idClaims && idClaims.iss && idClaims.iss.indexOf("/realms/") > -1 ? "keycloak" : "unknown",
            idToken: idClaims,
            accessToken: accessClaims || { opaque: user.access_token ? user.access_token.substring(0, 30) + "..." : "none" },
            session: { profile: user.profile, expires_at: user.expires_at, scope: user.scope, token_type: user.token_type },
          };
        } catch (e) { /* skip malformed */ }
      }
    }
    return null;
  }

  function fetchData(callback) {
    fetchNextAuth().then(function (result) {
      if (result) return callback(result);
      var oidcResult = fetchOidcClientTs();
      callback(oidcResult);
    });
  }

  // --- Rendering ---

  function renderClaimTable(claims) {
    if (!claims || typeof claims !== "object") return "<em style='color:#666'>No data</em>";
    var rows = Object.keys(claims).map(function (key) {
      var val = typeof claims[key] === "object" ? JSON.stringify(claims[key]) : String(claims[key]);
      if (val.length > 120) val = val.substring(0, 117) + "...";
      var desc = CLAIM_DESCRIPTIONS[key];
      var tooltip = desc ? "<span class='tip' title='" + desc.replace(/'/g, "&#39;") + "'>?</span>" : "";
      var color = isCustomClaim(key) ? "#f59e0b" : "#34d399";
      return "<tr><td class='ck'>" + key + tooltip + "</td><td style='color:" + color + "'>" + escHtml(val) + "</td></tr>";
    });
    return "<table>" + rows.join("") + "</table>";
  }

  function escHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderSection(title, claims, defaultOpen) {
    var count = claims ? Object.keys(claims).length : 0;
    var isOpen = state.sections[title] !== undefined ? state.sections[title] : defaultOpen;
    return "<div class='section'>" +
      "<button class='sec-btn' data-section='" + escHtml(title) + "'>" +
      "<span>" + title + "</span><span class='sec-meta'>" + (isOpen ? "▼" : "▶") + " " + count + " claims</span></button>" +
      "<div class='sec-body' style='display:" + (isOpen ? "block" : "none") + "'>" + renderClaimTable(claims) + "</div></div>";
  }

  // --- Widget ---

  var host, shadow, container, state = { open: false, data: null, dataHash: "", sections: {} };

  function createHost() {
    host = document.createElement("div");
    host.id = "poc-token-inspector-host";
    host.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;";
    document.body.appendChild(host);
    shadow = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = [
      ":host{all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;}",
      ".bar{background:#111827;border-top:1px solid #374151;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;color:#d1d5db;cursor:pointer;user-select:none;}",
      ".bar:hover{background:#1f2937}",
      ".badge{font-size:11px;padding:2px 8px;background:#374151;border-radius:4px;font-family:monospace;margin-right:8px;color:#9ca3af}",
      ".meta{color:#6b7280;font-size:12px}",
      ".panel{background:#030712;border-top:1px solid #374151;max-height:50vh;overflow-y:auto;padding:16px;}",
      ".section{border:1px solid #374151;border-radius:8px;overflow:hidden;margin-bottom:8px}",
      ".sec-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#1f2937;border:none;color:#e5e7eb;cursor:pointer;font-size:14px;font-family:inherit;text-align:left}",
      ".sec-btn:hover{background:#263040}",
      ".sec-meta{color:#6b7280;font-size:12px}",
      ".sec-body{background:#111827;padding:12px 16px;font-family:monospace;font-size:13px}",
      "table{width:100%;border-collapse:collapse}",
      "tr{border-bottom:1px solid #1f2937}",
      "tr:last-child{border:none}",
      "td{padding:4px 0;vertical-align:top}",
      ".ck{color:#9ca3af;white-space:nowrap;padding-right:16px}",
      ".tip{display:inline-block;width:14px;height:14px;border-radius:50%;background:#374151;color:#6b7280;text-align:center;line-height:14px;font-size:9px;margin-left:4px;cursor:help;font-family:sans-serif}",
      ".desc{font-size:12px;color:#9ca3af;margin-bottom:12px}",
    ].join("\n");
    shadow.appendChild(style);

    container = document.createElement("div");
    shadow.appendChild(container);
  }

  function render() {
    if (!state.data) {
      container.innerHTML = "";
      return;
    }
    var d = state.data;
    var idCount = d.idToken ? Object.keys(d.idToken).length : 0;
    var bar = "<div class='bar' id='toggle'>" +
      "<div><span class='badge'>" + escHtml(d.platform) + "</span>Token Inspector" +
      (idCount ? " <span class='meta'>(" + idCount + " ID token claims)</span>" : "") +
      "</div><span class='meta'>" + (state.open ? "▼ Close" : "▲ Open") + "</span></div>";

    var panel = "";
    if (state.open) {
      panel = "<div class='panel'>" +
        "<p class='desc'>Raw token claims from the identity broker. Custom claims highlighted in amber. Hover ? for descriptions. Source: " + escHtml(d.source) + "</p>" +
        renderSection("ID Token Claims", d.idToken, true) +
        renderSection("Access Token Claims", d.accessToken, false) +
        renderSection("Session Data", d.session, false) +
        "</div>";
    }
    container.innerHTML = (state.open ? panel : "") + bar;

    shadow.getElementById("toggle").addEventListener("click", function () {
      state.open = !state.open;
      render();
    });

    shadow.querySelectorAll(".sec-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sectionName = btn.getAttribute("data-section");
        var body = btn.nextElementSibling;
        var isOpen = body.style.display !== "none";
        body.style.display = isOpen ? "none" : "block";
        var meta = btn.querySelector(".sec-meta");
        if (meta) meta.textContent = (isOpen ? "▶" : "▼") + meta.textContent.substring(1);
        if (sectionName) state.sections[sectionName] = !isOpen;
      });
    });
  }

  function hashData(data) {
    if (!data) return "";
    try { return JSON.stringify({ s: data.source, p: data.platform, ic: data.idToken ? Object.keys(data.idToken).length : 0 }); }
    catch (e) { return String(Math.random()); }
  }

  function poll() {
    fetchData(function (data) {
      var newHash = hashData(data);
      var changed = newHash !== state.dataHash;
      state.data = data;
      state.dataHash = newHash;
      if (changed) render();
    });
  }

  // --- Init ---
  function init() {
    if (!document.body) return document.addEventListener("DOMContentLoaded", init);
    createHost();
    poll();
    setInterval(poll, POLL_INTERVAL);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
