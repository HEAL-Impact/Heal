# Stage 1: The Build Environment
FROM golang:1.21-bullseye AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o main .

# Final Stage: The Production-Ready Image
FROM debian:bullseye-slim

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libsqlite3-0

# Set the working directory
WORKDIR /root/

# Copy the built binary from builder stage
COPY --from=builder /app/main .

# Create directory for the database
RUN mkdir -p /data

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["./main"]