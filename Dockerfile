FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Ensure data directory exists
RUN mkdir -p data

# Railway injects $PORT at runtime
EXPOSE 3000

CMD ["node", "server.js"]
