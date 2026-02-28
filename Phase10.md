Perfect 👌
You want a **clear Phase 10 (Production Deployment) task list** so you can directly tell your developer what to do and where to do it.

I’ll write this in **task format**, so you can forward it directly.

---

# 🚀 PHASE 10 – PRODUCTION DEPLOYMENT & OPERATIONS

Goal:
Move Carbon Accounting backend from local → production-ready, secure, scalable deployment.

---

# ✅ STEP 1 — Prepare Production Configuration

📂 Location:
`src/main/resources/`

### Create:

```
application-prod.yml
```

### Developer Task:

* Move DB credentials to environment variables
* Disable show-sql
* Enable proper logging level
* Configure production database URL
* Enable HTTPS configuration

Example requirements:

* Use:

  * `SPRING_DATASOURCE_URL`
  * `SPRING_DATASOURCE_USERNAME`
  * `SPRING_DATASOURCE_PASSWORD`

* Set:

  * `spring.jpa.hibernate.ddl-auto=validate`
  * NOT update/create

---

# ✅ STEP 2 — Add Spring Boot Actuator

📂 Location:
`pom.xml`

### Developer Task:

* Add dependency:

  * `spring-boot-starter-actuator`
* Expose:

  * `/actuator/health`
  * `/actuator/metrics`
* Secure actuator endpoints

Purpose:
Production monitoring & health checks.

---

# ✅ STEP 3 — Logging Configuration

📂 Location:
`src/main/resources/`

### Create:

```
logback-spring.xml
```

### Developer Task:

* Configure:

  * File-based logging
  * Rolling logs (size + date based)
* Separate:

  * ERROR logs
  * APPLICATION logs

Purpose:
Production debugging + audit traceability.

---

# ✅ STEP 4 — Create Dockerfile

📂 Location:
Project root

### Developer Task:

Create:

```
Dockerfile
```

Requirements:

* Use OpenJDK 17 slim
* Copy JAR file
* Expose port 8080
* Run with:

  * `--spring.profiles.active=prod`

Purpose:
Containerized deployment.

---

# ✅ STEP 5 — Create docker-compose.yml

📂 Location:
Project root

### Developer Task:

Add services:

* backend
* postgres
* redis (optional future)
* kafka (optional future-ready)

Include:

* Environment variables
* Volume for postgres data
* Restart policy

Purpose:
Full local production simulation.

---

# ✅ STEP 6 — Database Production Setup

📂 Where:

Production DB server (AWS RDS / Managed DB)

### Developer Task:

* Create production PostgreSQL database
* Enable:

  * Connection pooling
  * SSL
* Apply Flyway migrations automatically
* Add indexes:

  * recorded_at
  * industry_id
  * tenant_id

Important:
Disable public DB access if possible.

---

# ✅ STEP 7 — Enable HTTPS

📂 Infrastructure level (Server / Nginx)

### Developer Task:

* Deploy Nginx as reverse proxy
* Install SSL certificate (Let's Encrypt)
* Forward traffic to backend container
* Disable direct 8080 public access

Purpose:
Secure communication.

---

# ✅ STEP 8 — Setup CI/CD Pipeline

📂 GitHub / GitLab

### Developer Task:

Create pipeline that:

1. Builds project
2. Runs tests
3. Builds Docker image
4. Pushes to Docker registry
5. Deploys to server

Purpose:
Automatic deployment on code push.

---

# ✅ STEP 9 — Production Security Hardening

📂 Security configuration

### Developer Task:

* Disable CORS wildcard
* Restrict allowed origins
* Enforce:

  * Strong password policy
  * JWT expiration
* Add rate limiting
* Add input validation

Optional:

* Add IP logging

---

# ✅ STEP 10 — Monitoring & Alerts

📂 Production environment

### Developer Task:

Enable:

* Actuator health checks
* Server monitoring (CPU/RAM)
* DB monitoring
* Disk usage alerts

Optional advanced:

* Prometheus + Grafana
* Log aggregation (ELK)

---

# 📦 FINAL DEPLOYMENT STRUCTURE (Production)

Server:

```
/carbon-accounting
   ├── docker-compose.yml
   ├── .env
   └── logs/
```

Running:

```
docker-compose up -d
```

Access:

```
https://yourdomain.com
```

---

# 🎯 FINAL CHECKLIST BEFORE GO-LIVE

Tell your developer to confirm:

✔ Prod profile working
✔ No hardcoded credentials
✔ Flyway migrations working
✔ DB indexes created
✔ HTTPS enabled
✔ Actuator secured
✔ Logging enabled
✔ JWT secured
✔ Docker image built
✔ CI/CD working

---

# 🔥 After Phase 10 Completion

Your system will be:

* Production-ready
* Secure
* Containerized
* Cloud deployable
* SaaS-ready
* Real-time ready for future

