# Use Node.js LTS version as base
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client (important!)
RUN npx prisma generate

# Expose backend port
EXPOSE 8080

# Start the server
CMD ["node", "src/index.js"]
