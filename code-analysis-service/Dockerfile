# Multi-stage build for Code Analysis Service
FROM maven:3.9.4-openjdk-17-slim AS build

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM openjdk:17-jdk-slim

# Add application user for security
RUN groupadd -r devflow && useradd -r -g devflow devflow

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /app/logs /app/temp && \
    chown -R devflow:devflow /app

WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create a script to wait for dependencies
COPY <<EOF wait-for-dependencies.sh
#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
until curl -f \$POSTGRES_HOST:\$POSTGRES_PORT 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up!"

echo "Waiting for RabbitMQ..."
until curl -f \$RABBITMQ_HOST:15672 2>/dev/null; do
  echo "RabbitMQ is unavailable - sleeping"
  sleep 1
done
echo "RabbitMQ is up!"

echo "Waiting for Eureka..."
until curl -f \$EUREKA_SERVER_URL/actuator/health 2>/dev/null; do
  echo "Eureka is unavailable - sleeping"
  sleep 1
done
echo "Eureka is up!"

echo "Starting Code Analysis Service..."
exec java \$JAVA_OPTS -jar app.jar
EOF

RUN chmod +x wait-for-dependencies.sh && \
    chown devflow:devflow wait-for-dependencies.sh

# Switch to non-root user
USER devflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8082/api/v1/actuator/health || exit 1

# Environment variables
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport" \
    SPRING_PROFILES_ACTIVE=docker \
    POSTGRES_HOST=postgres \
    POSTGRES_PORT=5432 \
    RABBITMQ_HOST=rabbitmq \
    EUREKA_SERVER_URL=http://eureka-server:8761/eureka/

EXPOSE 8082

ENTRYPOINT ["./wait-for-dependencies.sh"]