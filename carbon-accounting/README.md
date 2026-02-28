# Carbon Accounting System

Base architecture and database setup for Carbon Accounting.

## Technologies
- Spring Boot 3.2.3
- Java 17
- PostgreSQL (Docker)
- Flyway Migration
- Spring Data JPA
- Spring Security
- Lombok

## Getting Started
1. Run PostgreSQL in Docker:
   ```bash
   docker run --name carbon-postgres -e POSTGRES_DB=carbon_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -p 5433:5432 -d postgres
   ```
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   The server runs on port 8081.
