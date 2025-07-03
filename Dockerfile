# Use nginx to serve static
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
