FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE ${DEV_PORT}

# Development mode with TypeScript
CMD ["npm", "run", "dev"]
