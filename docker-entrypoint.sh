#!/bin/sh
# Replace PORT_PLACEHOLDER with the actual $PORT value Railway injects.
# Falls back to 8080 if PORT is not set (local Docker testing).
sed -i "s/PORT_PLACEHOLDER/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
