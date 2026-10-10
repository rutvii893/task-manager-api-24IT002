
# Use official Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifest files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Set default environment variable for port
ENV PORT=5000

# Start server
CMD ["npm", "start"]
