# Report Generation Service Dockerfile

FROM openjdk:17-jdk-slim

# Install curl and wkhtmltopdf for PDF generation
RUN apt-get update && \
    apt-get install -y curl wkhtmltopdf xvfb && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create reports directory
RUN mkdir -p /app/reports

# Expose port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8083/actuator/health || exit 1

# Set environment variables
ENV REPORTS_DIR=/app/reports
ENV WKHTMLTOPDF_PATH=/usr/bin/wkhtmltopdf

# Run the application
CMD ["java", "-jar", "target/report-service-1.0.0.jar"]