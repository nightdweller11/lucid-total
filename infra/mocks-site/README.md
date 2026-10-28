# The mocks site — `totalmocks.belucid.chat`

The mock galleries and the map study, served from a dependency-free Node static server on Railway so the owner can share them by link. Set up 2026-10-28 (owner instruction T31 in `docs/12`).

| | |
|---|---|
| Railway project | `lucid-total-mocks` (workspace "nightdweller11's Projects"), environment `production`, service `mocks-site` |
| Hosts | **https://totalmocks.belucid.chat** (custom domain; DNS on the owner's Cloudflare zone, DNS-only, Railway's certificate) and https://mocks-site-production.up.railway.app |
| What is served | `/` the v0.2 gallery (`docs/04-mocks/index.html`), `/map-study/` the map study with `/map-study/STUDY.md`, `/v0.1/` the archived first wave, `/README.md`, `/BRIEF-v0.2.md`, `/start.html` a landing page with the links; `/healthz` |
| Auth | public by default; setting `MOCKS_SITE_USER` and `MOCKS_SITE_PASSWORD` on the service turns on HTTP basic auth (`/healthz` stays open) |
| Image | `Dockerfile` here: `node:22.23.3-alpine`, the server and `public/` copied in; no dependencies |
| Cost | one small always-on service, about $1–3 a month on the Hobby plan |

## Publish

```
node infra/mocks-site/publish.mjs --dry-run   # assemble infra/mocks-site/build/ and list it
node infra/mocks-site/publish.mjs             # assemble and `railway up` (detached)
```

The script copies each gallery's `index.html`, `shots/` and Markdown files (never `gen/`), then uploads `build/` as the image root (`railway up --path-as-root --service mocks-site`). The CLI must be logged in (`railway whoami`) and the repo linked to the project (`railway link -p lucid-total-mocks -e production -s mocks-site`; the link lives in `~/.railway/config.json`, not in the repo). Republish after every change to `docs/04-mocks/`. Verify with:

```
curl -sI https://totalmocks.belucid.chat/healthz | head -1
curl -sI https://totalmocks.belucid.chat/ | head -1
```

## The custom domain

Attached with Railway's `customDomainCreate` (project, environment, service, `totalmocks.belucid.chat`, port 8080) using the workspace token in `~/.lucid/railway-account.env`, then the two records Railway asked for were created in the Cloudflare zone through its API with the token in `~/.lucid/cloudflare.env`: the `CNAME totalmocks → <id>.up.railway.app` and the `TXT _railway-verify.totalmocks` ownership record, both DNS-only (grey cloud), as Lucid Chat's `docs/runbooks/domains.md` does for `status.belucid.chat`. Railway issues the certificate once the CNAME resolves. Tokens never appear in output or in this file.

## Rollback

`railway redeploy` of the previous deployment in the Railway dashboard, or republish from an earlier commit of `docs/04-mocks/`.
