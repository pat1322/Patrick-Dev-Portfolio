FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (uses PORT_PLACEHOLDER, swapped at runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site files into nginx web root
COPY . /usr/share/nginx/html

# Copy and permission the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Railway injects $PORT at runtime; default fallback is 8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
