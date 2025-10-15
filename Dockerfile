# Stage 1: Build the React frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies from package.json
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js .

# Copy project documentation needed inside the container
COPY README.md .

# Expose the port the server will run on
EXPOSE 3001

# Command to start the server
CMD ["node", "server.js"]
