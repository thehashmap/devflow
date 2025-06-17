# DevFlow - Distributed Code Quality Platform

A microservices-based platform for code analysis and quality assessment using AI-powered tools.

## Architecture

- **API Gateway**: Routes requests and handles authentication
- **User Service**: User management and authentication
- **Code Analysis Service**: AI-powered code analysis using Ollama
- **Report Service**: Generate and store analysis reports
- **Notification Service**: Real-time notifications and alerts

## Tech Stack

- **Backend**: Spring Boot 3.x, Spring Cloud Gateway
- **Databases**: PostgreSQL, MongoDB, Redis
- **Messaging**: RabbitMQ
- **AI**: Ollama with MCP integration
- **Frontend**: React
- **Containerization**: Docker & Docker Compose

## Quick Start

1. Clone the repository
2. Run `docker-compose up -d` to start databases
3. Start services individually or use Docker

## Development Progress

- [x] Project structure and Docker setup
- [x] User Service implementation
- [x] API Gateway setup
- [ ] Code Analysis Service
- [ ] Report Service
- [ ] Notification Service
- [ ] Frontend React app

## API Documentation

Will be available at `http://localhost:8080/swagger-ui.html` once services are running.