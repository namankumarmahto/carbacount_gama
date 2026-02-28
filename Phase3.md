Perfect 👍
Now I’ll give you **Phase 3 (Application Layer) – Developer Task Breakdown** in a **clear, professional format** so you can directly assign it to your developer.

This phase focuses on:

> Building the Application Layer (Use Cases + DTOs + Mapping + Business Orchestration)

No UI. No DB structure changes. Just clean use-case implementation.

---

# 🚀 PHASE 3 — APPLICATION LAYER IMPLEMENTATION

## 🎯 Objective

Implement use-case driven architecture that:

* Receives validated input
* Calls domain services
* Calls repository interfaces
* Returns structured response DTO
* Keeps controller thin
* Keeps business logic out of controllers

---

# 📁 Where To Work

All work will be inside:

```plaintext
src/main/java/com/carbon/accounting/application/
```

Structure must be:

```plaintext
application/
│
├── dto/
├── mapper/
└── usecase/
```

---

# ✅ STEP 1 — Create DTO Classes

📁 Location:

```
application/dto/
```

### Developer must create:

### 1️⃣ AddEmissionRequestDTO

Fields:

* UUID plantId
* Double scope1
* Double scope2
* Double scope3
* LocalDateTime recordedAt

---

### 2️⃣ EmissionResponseDTO

Fields:

* UUID emissionId
* Double totalEmission
* LocalDateTime recordedAt
* UUID plantId

---

### 3️⃣ DashboardResponseDTO

Fields:

* Double totalEmission
* Double scope1Total
* Double scope2Total
* Double scope3Total
* Double carbonIntensity
* List<MonthlyTrendDTO>

---

### 4️⃣ MonthlyTrendDTO

Fields:

* String month
* Double emission

---

# ✅ STEP 2 — Create Mapper Classes

📁 Location:

```
application/mapper/
```

Developer must create:

### EmissionMapper

Responsibilities:

* Convert AddEmissionRequestDTO → Domain EmissionRecord
* Convert Domain EmissionRecord → EmissionResponseDTO

Important:
Mapping logic must NOT be inside controller.

---

# ✅ STEP 3 — Implement Use Cases

📁 Location:

```
application/usecase/
```

---

## 1️⃣ AddEmissionUseCase

Responsibilities:

* Validate request DTO
* Convert DTO → Domain model
* Call EmissionDomainService (core layer)
* Call EmissionRepository (core interface)
* Return ResponseDTO

Flow:

```
Controller → AddEmissionUseCase → DomainService → Repository → Return DTO
```

---

## 2️⃣ GetDashboardUseCase

Responsibilities:

* Get all emissions for industry
* Call AggregationService (core layer)
* Compute totals
* Compute carbon intensity
* Build DashboardResponseDTO
* Return structured response

No SQL logic inside use case.

Repository should expose method like:

```
findByIndustryId(UUID industryId)
```

---

## 3️⃣ IngestRealtimeDataUseCase

Responsibilities:

* Accept high-frequency emission input
* Save raw data only
* Do NOT aggregate here
* Trigger async processing (future ready)

Keep it simple for now:
Just store raw timestamped data.

---

# ✅ STEP 4 — Define Validation Rules

Validation must happen in:

* Use case layer
  OR
* DTO level with annotations

Add checks:

* Scope values cannot be negative
* recordedAt cannot be future date
* plantId must exist

If invalid → throw ApplicationException

---

# ✅ STEP 5 — Define Application Exceptions

📁 Location:

```
application/exception/
```

Create:

* InvalidEmissionDataException
* PlantNotFoundException
* UnauthorizedAccessException

Do NOT use generic RuntimeException.

---

# ✅ STEP 6 — Keep Controllers Thin

Controllers (in interfaces layer) must only:

* Accept request
* Call use case
* Return response

No:

* Calculation
* Mapping
* Validation logic
* Repository calls

---

# 📌 Final Flow After Phase 3

For Add Emission:

```
REST Controller
      ↓
AddEmissionUseCase
      ↓
EmissionMapper
      ↓
EmissionDomainService
      ↓
EmissionRepository (interface)
      ↓
Infrastructure Implementation (JPA)
```

Clean separation.

---

# 🔥 Definition of Done (Phase 3 Complete When:)

✔ All use cases implemented
✔ DTOs separated
✔ No business logic in controller
✔ No JPA code inside application layer
✔ Proper exception handling
✔ Unit tests for use cases
✔ Code review passes

---

# 🧠 Important Rule For Developer

Application layer:

✔ Can depend on core
❌ Cannot depend on infrastructure
❌ Cannot depend on controller

---

# 🎯 What You Should Tell Your Developer

Tell him:

> Implement Phase 3 Application Layer.
> Create DTOs, Mappers, and Use Cases.
> Use repository interfaces only.
> No database logic in use cases.
> No business logic in controllers.
> Keep structure clean and scalable.

---
