FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 to be accessible from host
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
