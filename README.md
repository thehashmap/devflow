# DevFlow - Code Quality Platform

A microservices-based platform for AI-powered code analysis and quality assessment.

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# Start frontend
cd frontend
npm install
npm start
```

**Login:** demo@devflow.com / demo123

**Access:** http://localhost:3000

## 🏗️ Architecture

- **API Gateway** (8080) - Routes & authentication
- **User Service** (8081) - User management
- **Code Analysis** (8082) - AI code analysis
- **Report Service** (8083) - Report generation
- **Notification** (8084) - Real-time notifications
- **Eureka Server** (8761) - Service discovery

## 🛠️ Tech Stack

**Backend:** Spring Boot 3.x, Spring Cloud Gateway  
**Frontend:** React, Axios, TailwindCSS  
**Databases:** PostgreSQL, MongoDB, Redis  
**Messaging:** RabbitMQ  
**AI:** Ollama (CodeLlama)

## 🔧 Development

### Run Services Locally
```bash
# Start databases only
docker-compose up -d postgres-user postgres-analysis mongodb redis rabbitmq ollama

# Run services with Maven
cd user-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
cd code-analysis-service && mvn spring-boot:run
```

### Troubleshooting

**CORS errors?** Make sure frontend proxy is configured in `package.json`

**Login fails?** Check if User Service is running on port 8081

**Services won't start?** Ensure Docker Desktop is running

## 📝 API Documentation

Swagger UI: http://localhost:8081/swagger-ui.html
