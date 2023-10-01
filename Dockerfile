# Use the official Golang image as a base image
FROM golang:1.17

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to the container
COPY go.mod ./

# Download all dependencies
RUN go mod download

# Copy the entire project to the container
COPY . .

# Build the Go app
RUN go build -o main .

# Expose port 8080 for the application
EXPOSE 8080

# Command to run the application
CMD ["./main"]


ENV MY_API_KEY BQYdHYhilyWCcxKn29hK6W9ZNPmm7oAC

