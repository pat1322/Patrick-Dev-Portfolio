FROM node:20-alpine

WORKDIR /app

# Install Node dependencies (cached layer — reinstall only if package.json changes)
COPY package.json ./
RUN npm install --production

# Copy all site files
COPY . .

# Bundle a seed copy of config.json outside the volume mount point so
# server.js can populate /app/data/ on the very first boot
RUN mkdir -p /app/data-seed && cp /app/data/config.json /app/data-seed/config.json

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Railway injects $PORT at runtime; 8080 is the local fallback
EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
