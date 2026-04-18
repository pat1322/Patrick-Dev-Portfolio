# Stage 1: build image (copy files)
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all site files into nginx's web root
COPY . /usr/share/nginx/html

# Railway uses port 8080 by default
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
