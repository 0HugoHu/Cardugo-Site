# Cardugo Site

The public static website for the **Cardugo** iOS app — the marketing landing page and privacy policy, in 8 languages — packaged as a tiny nginx Docker image so it can be self-hosted on a NAS via the [Unraid Docker Controller](https://github.com/0HugoHu/Unraid-Docker-Controller).

The page content is authored in the **private Cardugo repo** (`Cardugo/Docs/`) and mirrored here with a sync script. This repo is intentionally public and contains only the already-public web assets — no app source, no internal product notes.

## What's in the image

- `site/index.html` — landing page (8-language toggle, privacy-first messaging)
- `site/privacy.html` — privacy policy (8-language toggle)
- `site/i18n.js` — shared client-side i18n engine used by both pages

Served by nginx with clean URLs (`/privacy` → `privacy.html`), gzip, and a strict set of security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). The site makes no external requests — fitting, given the app's no-network promise.

## Run it locally

```bash
docker compose up -d --build
# open http://localhost:8080  (and http://localhost:8080/privacy)
docker compose down
```

Or with plain Docker:

```bash
docker build -t cardugo-site .
docker run -d --name cardugo-site -p 8080:80 cardugo-site
```

Health check: `GET /healthz` returns `200 ok`.

## Host it on the NAS (Unraid Docker Controller)

The controller builds this repo's root `Dockerfile` straight from a GitHub URL:

1. In the controller UI, **Add App**.
2. **Repository URL**: this repo's public Git URL. **Branch**: `main`.
3. The controller reads [`nas-controller.json`](./nas-controller.json) for defaults
   (name, description, internal port `80`) and allocates a host port in `13001–13999`.
4. **Build**, then **Start**. The site is then reachable at `http://<nas>:<allocated-port>/`.
5. Point your domain / Cloudflare Tunnel at that port as you do for other apps.

To ship an update: push to `main` here, then hit **Rebuild** on the app in the controller.

## Updating the content

Content changes are made in the private Cardugo repo, then synced here:

```bash
# from this repo's root
scripts/sync-from-cardugo.sh                       # uses ../cardugo/Cardugo/Docs
scripts/sync-from-cardugo.sh /path/to/Cardugo/Docs # or pass the path
scripts/sync-from-cardugo.sh --commit              # sync + commit in one step
```

The script copies only `index.html`, `privacy.html`, and `i18n.js` into `site/`.
Then:

```bash
git push
```

…and rebuild the app in the controller.

## Layout

```
.
├── Dockerfile             # nginx:alpine serving ./site on port 80
├── nginx.conf             # clean URLs, gzip, security headers, /healthz
├── docker-compose.yml     # local/standalone run (8080:80)
├── nas-controller.json    # controller auto-config (defaultPort 80)
├── site/                  # static content, synced from Cardugo/Docs
│   ├── index.html
│   ├── privacy.html
│   └── i18n.js
└── scripts/
    └── sync-from-cardugo.sh
```

## License

MIT — see [LICENSE](./LICENSE).
