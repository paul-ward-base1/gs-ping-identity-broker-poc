#!/usr/bin/env bash
# Tag a deployed release. The tag name IS the image version string, so it doubles
# as the redeploy input for deploy-app.yml.
#
# Usage: scripts/tag-release.sh <version> [commit]
#   version   required, e.g. 20260605-3 (matches the ECR image tag)
#   commit    optional, defaults to HEAD. Pass the commit the deployed image was
#             built from when main has advanced past it.
set -euo pipefail

version="${1:-}"
commit="${2:-HEAD}"

if [[ -z "$version" ]]; then
  echo "usage: $0 <version> [commit]" >&2
  exit 1
fi

if git rev-parse -q --verify "refs/tags/$version" >/dev/null; then
  echo "tag '$version' already exists" >&2
  exit 1
fi

sha="$(git rev-parse --verify "${commit}^{commit}")" || {
  echo "could not resolve commit '$commit'" >&2
  exit 1
}

echo "Tagging release '$version' -> $sha"
git --no-pager log -1 --format='  %h %s (%an, %ad)' --date=short "$sha"
read -r -p "Create and push this tag? [y/N] " reply
[[ "$reply" == [yY] ]] || { echo "aborted"; exit 1; }

git tag -a "$version" "$sha" -m "Released $version on $(date +%Y-%m-%d)"
git push origin "$version"
echo "pushed tag '$version'"
