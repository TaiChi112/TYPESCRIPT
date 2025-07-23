# Use the official Bun image
FROM oven/bun:1-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose port (adjust if your app uses a different port)
EXPOSE 3001

# Command to run the application
CMD ["bun", "run", "src/index.ts"]
