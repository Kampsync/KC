# Use node
FROM node:18-alpine

# Create app dir
WORKDIR /usr/src/app

# Install app deps
COPY package*.json ./
RUN npm install

# Copy static files
COPY . .

# Expose and run
EXPOSE 8080
CMD [ "npm", "start" ]
