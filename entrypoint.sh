#!/bin/sh

cat <<EOF > /usr/share/nginx/html/frontend/config.js
window.__APP_CONFIG__ = {
  BACKEND_URL: "${BACKEND_URL}"
}
EOF

exec "$@"