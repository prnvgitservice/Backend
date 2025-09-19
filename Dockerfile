# Use Node.js base image
FROM node:18

# Set working directory inside container
# WORKDIR /app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose port (Cloud Run expects environment variable $PORT)
EXPOSE 8080

# Start the app
# CMD ["npm", "start"]
CMD ["node", "server.js"]
