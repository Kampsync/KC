# Use nginx
FROM nginx:alpine

# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*

# Copy your static files into nginx public directory
COPY . /usr/share/nginx/html

# Nginx defaults to serving on 80, but Cloud Run expects 8080
# So we'll adjust nginx config
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Expose the port (not strictly needed on Cloud Run, but clean)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
