
create a website without ui and with clean architecture and with database connected and with production-ready structure and with future real-time ready and with no UI included

# 🚀 PHASE 1 — FOUNDATION SETUP (Backend Core Structure)

### 🎯 Objective:

Set up a professional backend base that is:

* Clean architecture
* Database connected
* Production-ready structure
* Future real-time ready
* No UI included

---

# ✅ TASK 1 — Create Base Project

## 📌 What To Do:

* Create a Spring Boot project
* Use Java 17+
* Use Maven

## 📦 Required Dependencies:

* Spring Web
* Spring Data JPA
* PostgreSQL Driver
* Spring Security (just include, no full setup yet)
* Lombok
* Flyway Migration
* Validation

## 📁 Project Name:

```
carbon-accounting
```

---

# ✅ TASK 2 — Create Professional Folder Structure

Inside:

```
src/main/java/com/carbon/accounting
```

Create:

```
config/
core/
application/
infrastructure/
interfaces/
common/
```

### Inside `core/` create:

```
core/domain/model
core/domain/service
core/repository
core/exception
```

### Inside `infrastructure/` create:

```
infrastructure/persistence/entity
infrastructure/persistence/repository
infrastructure/config
```

### Inside `interfaces/` create:

```
interfaces/rest
interfaces/scheduler
interfaces/websocket
```

📌 Important:
No business logic in controller.

---

# ✅ TASK 3 — Setup PostgreSQL Locally (Docker)

### Developer Must:

1. Install Docker
2. Run:

```bash
docker run --name carbon-postgres \
-e POSTGRES_DB=carbon_db \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=admin \
-p 5432:5432 \
-d postgres
```

---

# ✅ TASK 4 — Configure application.yml

Create:

```
src/main/resources/application.yml
```

Add:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/carbon_db
    username: postgres
    password: admin
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true

server:
  port: 8080
```

📌 Use `validate` not `update`.

---

# ✅ TASK 5 — Setup Flyway Migration

Create folder:

```
src/main/resources/db/migration
```

Create file:

```
V1__init_base_tables.sql
```

Add:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE industry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES industry(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emission_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID REFERENCES plant(id),
    scope1 DOUBLE PRECISION,
    scope2 DOUBLE PRECISION,
    scope3 DOUBLE PRECISION,
    total_emission DOUBLE PRECISION,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emission_recorded_at ON emission_record(recorded_at);
CREATE INDEX idx_emission_plant_id ON emission_record(plant_id);
```

📌 This makes it real-time ready (timestamp based).

---

# ✅ TASK 6 — Create Core Domain Models (No JPA Here)

Inside:

```
core/domain/model
```

Create:

* Industry.java
* Plant.java
* EmissionRecord.java

⚠ Important:

* No @Entity annotation
* Pure Java classes
* Include validation logic in constructors

---

# ✅ TASK 7 — Create Repository Interfaces

Inside:

```
core/repository
```

Create:

* IndustryRepository.java
* PlantRepository.java
* EmissionRepository.java

Only define methods:

```java
EmissionRecord save(EmissionRecord record);
List<EmissionRecord> findByPlantId(UUID plantId);
```

No implementation here.

---

# ✅ TASK 8 — Infrastructure Persistence Implementation

Inside:

```
infrastructure/persistence/entity
```

Create JPA entities:

* IndustryEntity
* PlantEntity
* EmissionRecordEntity

Inside:

```
infrastructure/persistence/repository
```

Create:

* JpaIndustryRepository
* JpaPlantRepository
* JpaEmissionRepository

These must:

* Implement core repository interfaces
* Use Spring Data JPA internally

---

# ✅ TASK 9 — Test Application Startup

Developer must:

1. Run application
2. Confirm:

   * Flyway runs successfully
   * Tables created in PostgreSQL
   * No Hibernate auto table creation
   * No startup errors

Check using:

```bash
docker exec -it carbon-postgres psql -U postgres -d carbon_db
```

Then:

```sql
\dt
```

Tables must exist.

---

# ✅ TASK 10 — Commit to Git

Create:

```
.gitignore
README.md
```

Commit message:

```
Phase 1 - Base architecture + DB setup completed
```

---

# 🎯 PHASE 1 COMPLETION CHECKLIST

✔ Clean folder structure
✔ PostgreSQL running in Docker
✔ Flyway migration working
✔ UUID-based tables
✔ Timestamp-based emission storage
✔ Domain models separated from JPA
✔ Repository interfaces separated
✔ Application runs without error

