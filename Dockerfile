# Dockerfile for Expo (React Native) app
# Use Node.js image for building and running Metro bundler
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* yarn.lock* ./


# Install expo-cli globally and project dependencies
RUN npm install -g expo-cli && npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start Metro bundler
CMD ["npm", "start"]
