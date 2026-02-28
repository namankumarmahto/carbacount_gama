Perfect 👌
Now I’ll give you **Phase 2 (Database + Persistence Layer)** in a way that you can directly assign tasks to your developer.

This will be **clear, professional, and task-based**.

---

# 🚀 PHASE 2 — Database + Persistence Layer Implementation

## 🎯 Objective of Phase 2

* Setup production-ready PostgreSQL
* Create database schema using Flyway
* Implement JPA entities
* Implement repository layer
* Ensure data saves correctly
* Keep core layer independent

---

# 📌 TASK GROUP 1 — Database Setup

## ✅ Task 2.1 — Setup PostgreSQL (Local via Docker)

**Where:** Local machine

Developer must:

1. Install Docker (if not installed)
2. Run:

```bash
docker run --name carbon-postgres \
-e POSTGRES_DB=carbon_db \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=admin \
-p 5432:5432 \
-d postgres
```

3. Verify DB is running:

```bash
docker ps
```

---

## ✅ Task 2.2 — Configure application-dev.yml

**Where:**
`src/main/resources/application-dev.yml`

Developer must add:

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
```

⚠ Important: Use `validate`, not `update` (professional practice).

---

# 📌 TASK GROUP 2 — Add Flyway Migration

## ✅ Task 2.3 — Add Flyway Dependency

Add in `pom.xml`:

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
```

---

## ✅ Task 2.4 — Create Migration Folder

**Where:**

```
src/main/resources/db/migration
```

---

## ✅ Task 2.5 — Create Migration Files

### 🔹 V1__create_industry.sql

```sql
CREATE TABLE industry (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);
```

---

### 🔹 V2__create_plant.sql

```sql
CREATE TABLE plant (
    id UUID PRIMARY KEY,
    industry_id UUID REFERENCES industry(id),
    name VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);
```

---

### 🔹 V3__create_emission_record.sql

```sql
CREATE TABLE emission_record (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES plant(id),
    scope1 DOUBLE PRECISION,
    scope2 DOUBLE PRECISION,
    scope3 DOUBLE PRECISION,
    total_emission DOUBLE PRECISION,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_emission_recorded_at ON emission_record(recorded_at);
CREATE INDEX idx_emission_plant_id ON emission_record(plant_id);
```

---

### 🔹 V4__create_energy_record.sql

```sql
CREATE TABLE energy_record (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES plant(id),
    electricity_kwh DOUBLE PRECISION,
    fuel_used DOUBLE PRECISION,
    fuel_type VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL
);
```

---

## ✅ Task 2.6 — Run Application

Developer runs:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Flyway should auto-create tables.

Check using pgAdmin or DBeaver.

---

# 📌 TASK GROUP 3 — JPA Entity Implementation

**Where:**

```
infrastructure/persistence/entity
```

Developer must:

* Create IndustryEntity
* Create PlantEntity
* Create EmissionRecordEntity
* Create EnergyRecordEntity

Use:

* @Entity
* @Table
* @Id
* @ManyToOne
* UUID type
* Proper indexing

⚠ Business logic must NOT be inside entity.

---

# 📌 TASK GROUP 4 — Repository Implementation

---

## Step 2.7 — Create JPA Repositories

**Where:**

```
infrastructure/persistence/repository
```

Create:

* SpringDataIndustryRepository
* SpringDataPlantRepository
* SpringDataEmissionRepository
* SpringDataEnergyRepository

Each extends:

```java
JpaRepository<Entity, UUID>
```

---

## Step 2.8 — Implement Core Repository Interfaces

**Where:**

```
core/repository
```

These are interfaces only.

Example:

```java
public interface EmissionRepository {
    EmissionRecord save(EmissionRecord record);
    List<EmissionRecord> findByPlantId(UUID plantId);
}
```

---

## Step 2.9 — Implement Adapter

Create:

```
infrastructure/persistence/repository/EmissionRepositoryImpl.java
```

This class:

* Implements core EmissionRepository
* Uses SpringDataEmissionRepository internally
* Maps Entity ↔ Domain

---

# 📌 TASK GROUP 5 — Mapping Layer

**Where:**

```
infrastructure/persistence/mapper
```

Create:

* EmissionMapper
* IndustryMapper
* PlantMapper

Mapping between:

* Entity
* Domain Model

---

# 📌 TASK GROUP 6 — Validation Test

Developer must:

1. Create simple REST endpoint:

   * POST /test/saveIndustry
2. Save one industry
3. Verify:

   * Data saved in PostgreSQL
   * No business logic in entity
   * No direct DB call in controller

---

# 🎯 Completion Criteria for Phase 2

Phase 2 is complete only if:

✔ Tables created using Flyway
✔ No ddl-auto=update
✔ UUID used everywhere
✔ Repository interfaces separated
✔ Entities separated from domain models
✔ Data saved and retrieved successfully
✔ Indexes created
✔ No business logic inside persistence layer

