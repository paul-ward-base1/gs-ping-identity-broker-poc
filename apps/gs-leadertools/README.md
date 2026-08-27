# gs-vtk-backend

Next.js 16 / React 19 web application for the **Girl Scouts Virtual Trail Kit (VTK)**. Displays badges and activities sourced from AEM GraphQL, with search powered by AWS OpenSearch Serverless.

## Prerequisites

- Node.js 22+
- Yarn (`npm install -g yarn`)

## Getting Started

```bash
yarn install
```

Open [http://localhost:3000/en](http://localhost:3000/en) after starting the dev server.

> The first URL segment is always a locale (`en` or `es`). Visiting `/` redirects automatically.

## Commands

| Command                      | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `ENV=dev yarn dev`           | Dev server against AEM dev                                    |
| `ENV=uat yarn dev`           | Dev server against AEM UAT                                    |
| `ENV=ue.local yarn local:ue` | Start Universal Editor mode locally (HTTPS, local AEM author) |
| `ENV=ue.dev yarn dev:ue`     | Start Universal Editor mode against dev AEM author            |
| `ENV=dev yarn build`         | Production build                                              |
| `yarn start`                 | Production server                                             |
| `yarn lint`                  | ESLint                                                        |
| `yarn format`                | Prettier write                                                |
| `yarn storybook`             | Storybook on port 6006                                        |
| `QA_ENV=local yarn test`     | Playwright E2E (auto-starts dev server)                       |
| `yarn test:unit`             | Vitest (Storybook component tests)                            |

> `ENV=` is required for local development — `next.config.ts` calls `dotenv.config()` to load `.env.<ENV>`. Running `yarn dev` without it only loads the bare `.env`, which lacks `AEM_DAM_PATH` and other required variables.

## Environment Files

All env files are committed to the repository.

| File         | Purpose                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `.env`       | **Production** — loaded automatically by Next.js (`yarn build`, `yarn start`) |
| `.env.dev`   | Overrides for AEM dev (`dev.girlscouts.org`)                                  |
| `.env.uat`   | Overrides for AEM UAT (`uat.girlscouts.org`)                                  |
| `.env.local` | Per-machine overrides — **not committed**                                     |

Next.js only auto-loads `.env` and `.env.local`. To run against a specific environment locally, set the `ENV` prefix — `next.config.ts` calls `dotenv.config()` and loads `.env.<ENV>` with override:

```bash
ENV=dev yarn dev    # loads .env.dev → AEM dev
ENV=uat yarn dev    # loads .env.uat → AEM UAT
```

### Key variables

| Variable                         | Description                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `AEM_API`                        | AEM base URL — server-side only, used by the image proxy route handler and API calls                            |
| `NEXT_PUBLIC_AEM_API`            | Same value, exposed to the client bundle (derived from `AEM_API` in `next.config.ts`)                           |
| `AEM_DAM_PATH`                   | DAM base path (e.g. `content/dam/gsusa-vtk-redesign`) — server-side, used by `/img/[...path]`                   |
| `NEXT_PUBLIC_AEM_DAM_PATH`       | Same, exposed to the client bundle for `buildImagePath()`                                                       |
| `AEM_AUTH`                       | AEM basic auth credentials (e.g. `admin:admin`) — dev/author mode only; sent as `Authorization: Basic <base64>` |
| `SEARCH_TYPE`                    | `mock` (no AWS needed) or `awsOpenSearch`                                                                       |
| `OPENSEARCH_COLLECTION_ENDPOINT` | OpenSearch Serverless collection endpoint                                                                       |
| `AWS_REGION` / `AWS_PROFILE`     | AWS credentials for local OpenSearch                                                                            |
| `NODE_TLS_REJECT_UNAUTHORIZED`   | Set to `0` in `.env.dev` to bypass TLS on AEM dev                                                               |
| `DEBUG`                          | Enables verbose debug logging                                                                                   |
| `AEM_MODE`                       | Set to `author` to enable UE instrumentation and cookie-based AEM auth                                          |
| `UE_SERVICE_URL`                 | Universal Editor service URL (local proxy or `https://universal-editor-service.adobe.io`)                       |

## Image Proxy

AEM DAM images are served through a Next.js Route Handler at `/img/[...path]` (`src/app/img/[...path]/route.ts`). This avoids exposing `/_next/image` as an SSRF vector and gives full control over TLS behavior per environment.

```
Browser → GET /img/common/.../badge.png
        → Route Handler → fetch(AEM_API + AEM_DAM_PATH + /path)
        → image streamed back to browser
```

`buildImagePath()` (`src/utils/buildImagePath.ts`) strips the DAM prefix and returns `/img/<relative-path>`.

## Universal Editor Mode

To author content via the [AEM Universal Editor](https://experience.adobe.com/#/aem/editor/canvas), the app connects to an AEM 6.5 author instance. Two modes are available: local and dev.

### Local mode (`ENV=ue.local`)

Runs against a local AEM author instance over HTTPS. Requires:

- A local AEM 6.5 LTS author instance at `https://localhost:8443` with the UE OSGi configs deployed (see `Girlscouts-Web-Redesign` repo, `config.author.local`)
- A local Universal Editor Service at `https://localhost:8000`:
  ```bash
  UES_DISABLE_IMS_VALIDATION=true UES_TLS_REJECT_UNAUTHORIZED=false UES_CORS_PRIVATE_NETWORK=true node universal-editor-service.cjs
  ```
- A self-signed TLS certificate in `certs/` (gitignored):
  ```bash
  mkdir -p certs
  openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/certificate.pem \
    -days 365 -nodes -subj "/CN=localhost"
  ```

```bash
ENV=ue.local yarn local:ue
```

The app is served on `https://localhost:3000`.

### Dev mode (`ENV=ue.dev`)

Runs against the dev AEM author instance using Adobe's hosted Universal Editor service. No local UE service or certificates needed.

```bash
ENV=ue.dev yarn dev:ue
```

The app is served on `http://localhost:3000`.

### Opening a page in Universal Editor

Paste the page URL into the Universal Editor canvas at `https://experience.adobe.com/#/aem/editor/canvas`, e.g.:

- Local: `https://localhost:3000/en/badge/daisy/cookie`
- Dev: `http://localhost:3000/en/badge/daisy/cookie`

Then use **Local Developer Login** in the UE toolbar to authenticate against AEM.

## Docker

```bash
# Production (uses .env)
docker build .

# Dev or UAT override
docker build --build-arg ENV=dev .
docker build --build-arg ENV=uat .
```

The `Dockerfile` uses `dotenv-cli` to inject the right env file at build time. When `ENV` is not set or has no matching `.env.$ENV` file, only `.env` is loaded (production).

## Releases & deploy tagging

Deploys to the upper environments (UAT and Unite) are triggered manually via [`deploy-app.yml`](.github/workflows/deploy-app.yml) and ship a specific image `version` — the `YYYYMMDD-n` tag produced by [`build.yml`](.github/workflows/build.yml).

That image is pinned and traceable, but the **version → commit** mapping lives only in ECR and CI logs, both of which age out. So answering "what was in UAT last Tuesday?" eventually means archaeology across Jenkins and GitHub Actions runs — until the trail is gone.

The fix is to record that mapping in the one place that lives in the repo forever: a **git tag whose name is the deployed version string**, pointing at the exact commit the image was built from. The convention:

- **One tag per release**, named exactly the image version (`20260605-3`) — not one per environment. The same artifact ships to both UAT and Unite, so a single date-version tag is the whole release line. (No SemVer: this is a deployed app with no external consumers, so the version carries no API-compatibility contract — the date-version is the right unit.)
- Because the tag name _is_ the version, **redeploying is copy-paste**: read the tag, drop it into `deploy-app.yml`'s `version` input.
- Tag the **built commit, not `HEAD`** — builds fire on every `main` push, so `main` may have moved on. The authoritative SHA is the `GIT_COMMIT` baked into the deployed image.
- A git tag is purely additive — it never creates a commit or moves `main`; it's just a named pointer to an existing commit.

### Tagging a release

Run right after the upper-env deploy completes. The helper confirms the target commit before pushing:

```bash
# Deployed HEAD (common case — deploying right after merge):
yarn tag:release 20260605-3

# main has moved on — pass the commit the deployed image was built from:
yarn tag:release 20260605-3 <built-sha>
```

The script reads a confirmation prompt from stdin. If your shell's `yarn` wrapper swallows that prompt, call the script directly instead — same arguments:

```bash
scripts/tag-release.sh 20260605-3
```

### Using the tags

```bash
# What commit is a given release?
git show 20260605-3

# What shipped between two releases — "what changed since last Tuesday"
git log --oneline 20260604-1..20260605-3

# Full release history (most recent first)
git tag --sort=-creatordate
```

## Testing

```bash
QA_ENV=local yarn test
```

`QA_ENV=local` automatically starts the dev server and Storybook before running tests. See `tests/` for test projects: `app`, `storybook`, `api`.

## Related Repos

- [`gs-vtk-opensearch`](../gs-vtk-opensearch) — script that triggers search reindexing on this app
- [`gs-vtk-terraform`](../gs-vtk-terraform) — AWS infrastructure that runs this app on ECS Fargate
