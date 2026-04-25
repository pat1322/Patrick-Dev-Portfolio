#!/bin/sh
# Replace PORT_PLACEHOLDER with the actual $PORT value Railway injects.
# Falls back to 8080 if PORT is not set (local Docker testing).
sed -i "s/PORT_PLACEHOLDER/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf

# Inject security credentials from Railway environment variables into gate.js.
# Set RECRUITER_CODE and ADMIN_PASS in Railway → Variables dashboard.
# If a variable is not set, the placeholder stays — nobody can type the
# literal placeholder string as a PIN/password, so the gate fails safely.
if [ -n "${RECRUITER_CODE}" ]; then
  sed -i "s/RECRUITER_CODE_PLACEHOLDER/${RECRUITER_CODE}/g" \
      /usr/share/nginx/html/assets/js/gate.js
fi
if [ -n "${ADMIN_PASS}" ]; then
  sed -i "s/ADMIN_PASS_PLACEHOLDER/${ADMIN_PASS}/g" \
      /usr/share/nginx/html/assets/js/gate.js
fi

exec nginx -g "daemon off;"
