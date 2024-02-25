# Build stage
FROM golang:1.21.6 as builder

WORKDIR /app

# Copy the Go files and go.mod, go.sum if they exist
COPY cmd/main.go .
COPY go.mod go.sum* ./

# Download dependencies (if any)
RUN go mod download

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Command to run the binary
CMD ["./main"]