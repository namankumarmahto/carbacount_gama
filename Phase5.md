Perfect 👍
Now I will write **Phase 5 (Real-Time Ready Implementation)** in a clear task format so you can directly give it to your developer.

This will be written like a professional task sheet.

---

# 🚀 PHASE 5 — Real-Time Ready Architecture

### 🎯 Goal:

Make backend ready to handle:

* Real-time emission data
* IoT/sensor integration (future)
* High-frequency data
* Aggregation without performance issues

---

# ✅ TASK 1 — Convert Emission Storage to Timestamp-Based

### 📁 Location:

`core/domain/model/EmissionRecord.java`

### 🔧 What To Do:

Replace date-based storage with:

```java
private Instant recordedAt;
private Instant createdAt;
```

### 📌 Instruction:

* Do NOT use LocalDate
* Use `Instant` (UTC-based)
* Every emission record must store exact timestamp

---

### 📁 Database Migration (Flyway)

Create new migration file:

```
src/main/resources/db/migration/V4__update_emission_timestamp.sql
```

Add:

```sql
ALTER TABLE emission_record 
ADD COLUMN recorded_at TIMESTAMP NOT NULL;

CREATE INDEX idx_emission_recorded_at 
ON emission_record(recorded_at);
```

---

# ✅ TASK 2 — Make Emission Records Immutable

### 📁 Location:

`core/domain/service/EmissionDomainService.java`

### 🔧 What To Do:

* Remove update method for emission
* Allow only:

  * save
  * fetch

⚠ No update/delete allowed.

Reason:
Carbon data must be audit-safe.

---

# ✅ TASK 3 — Create Real-Time Ingestion Layer (Future Kafka Ready)

### 📁 Create Folder:

```
infrastructure/messaging/
```

Create:

```java
RealTimeEmissionIngestionService.java
```

### 🔧 What To Do:

Create method:

```java
public void ingest(RealtimeEmissionDTO dto)
```

Inside:

* Validate DTO
* Convert to EmissionRecord
* Save via repository

For now:
Call this via REST API.
Later:
Kafka consumer will call this method.

---

# ✅ TASK 4 — Create Realtime API Endpoint

### 📁 Location:

`interfaces/rest/RealtimeEmissionController.java`

### 🔧 Endpoint:

```
POST /api/realtime/emission
```

This will call:
`RealTimeEmissionIngestionService`

This separates:
Normal emission API
Realtime emission API

---

# ✅ TASK 5 — Create Aggregation Service

### 📁 Location:

`core/domain/service/AggregationService.java`

### 🔧 Add Methods:

```java
public DailySummary aggregateDaily(UUID plantId, LocalDate date);
public MonthlySummary aggregateMonthly(UUID plantId, YearMonth month);
```

Do NOT calculate in controller.

---

# ✅ TASK 6 — Create Summary Tables (Very Important)

Instead of calculating dashboard from raw data, create summary tables.

### 📁 Migration File:

```
V5__create_emission_summary_tables.sql
```

Add:

```sql
CREATE TABLE emission_summary_daily (
    id UUID PRIMARY KEY,
    plant_id UUID,
    total_emission DOUBLE PRECISION,
    summary_date DATE
);

CREATE INDEX idx_summary_daily_date 
ON emission_summary_daily(summary_date);
```

---

# ✅ TASK 7 — Create Scheduled Aggregation Job

### 📁 Location:

`interfaces/scheduler/DailyAggregationScheduler.java`

Enable scheduling in main app:

```java
@EnableScheduling
```

Add:

```java
@Scheduled(cron = "0 0 1 * * ?")
public void runDailyAggregation() {
    // call AggregationService
}
```

Runs every night at 1 AM.

---

# ✅ TASK 8 — Prepare WebSocket Folder (Future Live Dashboard)

### 📁 Create Folder:

```
interfaces/websocket/
```

Create placeholder:

```java
WebSocketConfig.java
```

No logic needed now.
Just structure preparation.

---

# ✅ TASK 9 — Add Index Optimization

### 📁 Migration File:

```
V6__add_indexes.sql
```

Add:

```sql
CREATE INDEX idx_emission_plant 
ON emission_record(plant_id);

CREATE INDEX idx_emission_tenant 
ON emission_record(tenant_id);
```

This is critical for real-time performance.

---

# ✅ TASK 10 — Logging for Real-Time Events

### 📁 Location:

`common/logging/`

Add structured logging when:

* Real-time data received
* Aggregation completed

Use:

* Logback
* JSON logs if possible

---

# 🧠 FINAL STRUCTURE AFTER PHASE 5

```
core/
  domain/
    model/
    service/
      EmissionDomainService
      AggregationService

infrastructure/
  messaging/
    RealTimeEmissionIngestionService
  persistence/

interfaces/
  rest/
    RealtimeEmissionController
  scheduler/
    DailyAggregationScheduler
  websocket/
```

---

# 🎯 What Developer Should Deliver

After Phase 5:

✔ Emission data stored with timestamp
✔ Immutable emission records
✔ Separate realtime ingestion service
✔ Summary tables created
✔ Daily aggregation scheduler running
✔ DB indexes optimized
✔ System ready for Kafka integration
✔ Performance-ready for real-time dashboard

---

# 🔥 Important Instruction To Developer

Tell him clearly:

> Do not mix aggregation logic inside controller
> Do not calculate dashboard from raw data
> Do not allow emission updates
> Keep core layer independent from Spring
