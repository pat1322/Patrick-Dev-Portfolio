#!/bin/sh
# Replace PORT_PLACEHOLDER with the actual $PORT value Railway injects.
# Falls back to 8080 if PORT is not set (local Docker testing).
sed -i "s/PORT_PLACEHOLDER/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf

# Inject security credentials from Railway environment variables into gate.js.
# Set RECRUITER_CODE and ADMIN_PASS in Railway → Variables dashboard.
sed -i "s/RECRUITER_CODE_PLACEHOLDER/${RECRUITER_CODE:-2025}/g" \
    /usr/share/nginx/html/assets/js/gate.js
sed -i "s/ADMIN_PASS_PLACEHOLDER/${ADMIN_PASS:-PD@dmin25}/g" \
    /usr/share/nginx/html/assets/js/gate.js

exec nginx -g "daemon off;"
