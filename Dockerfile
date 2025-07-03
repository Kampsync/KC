# Use nginx as the base image
FROM nginx:alpine

# Copy all your static site files into nginx's html folder
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# nginx will automatically start
