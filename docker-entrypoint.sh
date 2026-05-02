#!/bin/sh
# Inject security credentials and gate text into gate.js at container start.
# RECRUITER_CODE, ADMIN_PASS, and GATE_SUBTITLE are set in Railway → Variables.
# If unset, the placeholder strings remain — those role paths become inaccessible.
if [ -n "${RECRUITER_CODE}" ]; then
  sed -i "s|RECRUITER_CODE_PLACEHOLDER|${RECRUITER_CODE}|g" /app/assets/js/gate.js
fi
if [ -n "${ADMIN_PASS}" ]; then
  sed -i "s|ADMIN_PASS_PLACEHOLDER|${ADMIN_PASS}|g" /app/assets/js/gate.js
fi
if [ -n "${GATE_SUBTITLE}" ]; then
  sed -i "s|GATE_SUBTITLE_PLACEHOLDER|${GATE_SUBTITLE}|g" /app/assets/js/gate.js
fi

exec node /app/server.js
