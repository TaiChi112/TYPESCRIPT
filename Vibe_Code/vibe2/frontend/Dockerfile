# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /

# Copy package.json and package-lock.json (if available)
COPY package.json bun.lock* ./

# Install dependencies using bun or npm
RUN if [ -f bun.lock ]; then \
    npm install -g bun && bun install --frozen-lockfile; \
    else \
    npm ci --only=production; \
    fi

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN if [ -f bun.lock ]; then \
    bun run build; \
    else \
    npm run build; \
    fi

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["sh", "-c", "if [ -f bun.lock ]; then bun run start; else npm start; fi"]
