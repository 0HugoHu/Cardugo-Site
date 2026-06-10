# Cardugo static site — served by nginx.
# Built by the Unraid Docker Controller from this repo's root Dockerfile.
FROM nginx:1.27-alpine

# Replace the default server block with ours (clean URLs, gzip, security headers).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static site content — synced from the private Cardugo repo's Docs/ into ./site.
COPY site/ /usr/share/nginx/html/

EXPOSE 80

# The controller maps an allocated host port (13001-13999) to this container's port 80.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/healthz >/dev/null 2>&1 || exit 1
