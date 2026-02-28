Perfect 💯
Now I’ll give you **Phase 9 – SaaS Conversion (Multi-Tenant + Audit Logging)** in a **clear task format** so you can directly assign it to your developer.

This will be structured as:

* 🎯 Objective
* 📂 Where to implement
* 🛠 What to implement
* ✅ Expected output

---

# 🚀 PHASE 9 – SaaS Conversion

---

# ✅ STEP 1 — Introduce Tenant Concept

---

## 🎯 Objective

Allow multiple industries (clients) to use the same system securely with isolated data.

---

## 📂 Where to implement

```
core/domain/model
core/repository
infrastructure/persistence/entity
interfaces/rest
infrastructure/security
```

---

## 🛠 What Developer Must Do

### 1️⃣ Create Tenant Domain Model

📂 `core/domain/model/Tenant.java`

Fields:

* UUID id
* String name
* String industryType
* Timestamp createdAt
* Boolean active

No Spring annotations.

---

### 2️⃣ Add tenant_id to All Domain Models

Modify:

* Industry
* Plant
* EmissionRecord
* EnergyRecord
* User

Add:

```java
UUID tenantId;
```

---

### 3️⃣ Update Database Schema

📂 `resources/db/migration`

Create new migration:

```
V4__add_tenant_support.sql
```

Add:

```sql
ALTER TABLE industry ADD COLUMN tenant_id UUID;
ALTER TABLE plant ADD COLUMN tenant_id UUID;
ALTER TABLE emission_record ADD COLUMN tenant_id UUID;
ALTER TABLE energy_record ADD COLUMN tenant_id UUID;
ALTER TABLE users ADD COLUMN tenant_id UUID;
```

Add index:

```sql
CREATE INDEX idx_emission_tenant ON emission_record(tenant_id);
```

---

### 4️⃣ Update Repository Interfaces

📂 `core/repository`

Modify methods:

Instead of:

```java
List<EmissionRecord> findByPlant(UUID plantId);
```

Use:

```java
List<EmissionRecord> findByTenantAndPlant(UUID tenantId, UUID plantId);
```

---

### 5️⃣ Implement Tenant Filtering in JPA

📂 `infrastructure/persistence/repository`

Update queries to include:

```java
WHERE e.tenantId = :tenantId
```

---

## ✅ Expected Result

Each tenant (industry client) only sees their own data.

---

# ✅ STEP 2 — Tenant Identification Mechanism

---

## 🎯 Objective

Automatically detect which tenant is making the request.

---

## 📂 Where to implement

```
infrastructure/security
interfaces/rest/filter
```

---

## 🛠 What Developer Must Do

### Option A (Recommended for SaaS):

Extract tenant from JWT.

1️⃣ Add tenantId in JWT claims.

2️⃣ Create:

📂 `interfaces/rest/filter/TenantFilter.java`

Filter should:

* Extract tenantId from JWT
* Store it in ThreadLocal

Example structure:

```java
TenantContext.setCurrentTenant(tenantId);
```

Create:

📂 `common/util/TenantContext.java`

ThreadLocal holder.

---

## ✅ Expected Result

Every request automatically knows which tenant it belongs to.

---

# ✅ STEP 3 — Enforce Tenant Isolation

---

## 🎯 Objective

Prevent cross-tenant data access.

---

## 📂 Where

```
application/usecase
core/domain/service
```

---

## 🛠 Tasks

In every use case:

Instead of passing tenant manually from controller:

```java
UUID tenantId = TenantContext.getCurrentTenant();
```

Use that internally.

Never accept tenantId from API body (security risk).

---

## ✅ Expected Result

System automatically filters data by tenant.

---

# ✅ STEP 4 — Add Audit Logging

---

## 🎯 Objective

Track who did what and when.

---

## 📂 Where

```
core/domain/model
infrastructure/persistence/entity
application/usecase
```

---

## 🛠 What to Implement

### 1️⃣ Create AuditLog Domain Model

📂 `core/domain/model/AuditLog.java`

Fields:

* UUID id
* UUID tenantId
* UUID userId
* String action
* String entityType
* UUID entityId
* String oldValue (JSON)
* String newValue (JSON)
* Timestamp createdAt
* String ipAddress

---

### 2️⃣ Create audit_log Table

📂 `V5__create_audit_log.sql`

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    user_id UUID,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP
);
```

Add index:

```sql
CREATE INDEX idx_audit_tenant ON audit_log(tenant_id);
```

---

### 3️⃣ Create Audit Service

📂 `application/service/AuditService.java`

Method:

```java
void logAction(...)
```

---

### 4️⃣ Call AuditService in Use Cases

Example:

In AddEmissionUseCase:

After saving emission:

```java
auditService.logAction(
    tenantId,
    userId,
    "CREATE_EMISSION",
    "EmissionRecord",
    emissionId,
    null,
    newValueJson
);
```

---

## ✅ Expected Result

Every data change is logged.

---

# ✅ STEP 5 — Secure Multi-Tenant Queries

---

## 🎯 Objective

Ensure admin cannot accidentally access all tenant data unless explicitly allowed.

---

## 📂 Where

```
infrastructure/security
application/usecase
```

---

## 🛠 Tasks

* Add role SUPER_ADMIN
* Only SUPER_ADMIN can query across tenants
* Normal ADMIN restricted to one tenant

---

## ✅ Expected Result

Proper SaaS security model.

---

# 📋 FINAL PHASE 9 CHECKLIST (Give This to Developer)

✔ Tenant entity created
✔ tenant_id added to all tables
✔ Migration files created
✔ Repository methods updated
✔ JWT contains tenantId
✔ TenantContext implemented
✔ TenantFilter implemented
✔ All queries filtered by tenant
✔ AuditLog entity created
✔ audit_log table created
✔ AuditService implemented
✔ All write operations logged
✔ Role-based multi-tenant isolation enforced

---

# 🔥 After Phase 9

Your project becomes:

> Multi-Industry SaaS Platform
> Production-grade
> Investor-ready architecture

