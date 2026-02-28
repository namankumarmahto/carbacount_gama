Perfect 👌
You are now at **PHASE 4 — SECURITY IMPLEMENTATION** for your Carbon Accounting backend.

Below is a **clear developer task document** you can directly give to your developer.

This includes:

* What to do
* Where to do
* File structure
* Exact responsibilities
* Expected outcome

No confusion.

---

# 🚀 PHASE 4 — SECURITY IMPLEMENTATION (JWT + Role Based Access)

## 🎯 Objective

Implement:

* JWT Authentication
* Role-based authorization
* Industry-level data isolation
* Secure API access
* Multi-tenant-ready structure

---

# 📁 1️⃣ Create Security Package Structure

Inside:

```id="9zq2an"
src/main/java/com/carbon/accounting
```

Create:

```id="zqf1ha"
infrastructure/security/
```

Inside security:

```id="z0q4ap"
JwtTokenProvider.java
JwtAuthenticationFilter.java
SecurityConfig.java
CustomUserDetailsService.java
UserPrincipal.java
```

---

# 🗄️ 2️⃣ Update User Entity

Location:

```id="yfa0nt"
infrastructure/persistence/entity/UserEntity.java
```

Add fields:

* id (UUID)
* name
* email
* password (BCrypt)
* role (ENUM: ADMIN, INDUSTRY, AUDITOR)
* industry_id (FK nullable for ADMIN)

Add unique constraint on email.

---

# 🧠 3️⃣ Create Role Enum

Location:

```id="uqg2ml"
core/domain/model/Role.java
```

```java
public enum Role {
    ADMIN,
    INDUSTRY,
    AUDITOR
}
```

---

# 🔐 4️⃣ Implement Password Encryption

Dependency:

Add in `pom.xml`:

```id="5yr41b"
spring-boot-starter-security
jjwt
```

Use:

```java
BCryptPasswordEncoder
```

---

# 🧑‍💻 5️⃣ Implement CustomUserDetailsService

Location:

```id="2fx2c3"
infrastructure/security/CustomUserDetailsService.java
```

Responsibilities:

* Load user by email
* Convert UserEntity → UserPrincipal
* Attach roles as authorities

---

# 🔑 6️⃣ Implement JWT Token Provider

Location:

```id="q9b4nk"
infrastructure/security/JwtTokenProvider.java
```

Responsibilities:

* Generate JWT
* Extract username
* Validate token
* Extract roles
* Extract industryId

Token should contain:

* userId
* email
* role
* industryId

Expiration: 24 hours

---

# 🔎 7️⃣ Create JWT Authentication Filter

Location:

```id="p7wnj2"
infrastructure/security/JwtAuthenticationFilter.java
```

Responsibilities:

* Read Authorization header
* Extract Bearer token
* Validate JWT
* Set Authentication in SecurityContext

---

# ⚙️ 8️⃣ Configure Security

Location:

```id="8ev5mz"
infrastructure/security/SecurityConfig.java
```

Tasks:

* Disable CSRF (if REST only)
* Stateless session
* Permit:

  * `/api/auth/login`
  * `/api/auth/register`
* Secure all other APIs
* Add JWT filter before UsernamePasswordAuthenticationFilter

---

# 🧾 9️⃣ Create AuthController

Location:

```id="ak3fzx"
interfaces/rest/AuthController.java
```

Endpoints:

### POST `/api/auth/register`

* Accept name, email, password, role
* Encode password
* Save user

### POST `/api/auth/login`

* Authenticate
* Generate JWT
* Return token

Response format:

```json
{
  "token": "...",
  "role": "INDUSTRY",
  "industryId": "uuid"
}
```

---

# 🛡️ 🔟 Role-Based Access Control

Use annotations in controllers:

Example:

```java
@PreAuthorize("hasRole('ADMIN')")
```

Example:

```java
@PreAuthorize("hasRole('INDUSTRY')")
```

Enable method security in config:

```java
@EnableMethodSecurity
```

---

# 🏭 1️⃣1️⃣ Industry Data Isolation (VERY IMPORTANT)

When INDUSTRY user requests dashboard:

System must:

* Extract industryId from JWT
* Automatically filter data by industryId
* NEVER allow manual industryId override

Example:

```java
UUID industryId = jwtTokenProvider.getIndustryId(token);
```

Repository query must filter:

```sql
WHERE industry_id = ?
```

---

# 🧪 1️⃣2️⃣ Testing Tasks

Developer must test:

1. Register ADMIN
2. Register INDUSTRY
3. Login → get token
4. Access secured endpoint with token
5. Try accessing without token → 401
6. Try accessing other industry data → forbidden

---

# 📦 1️⃣3️⃣ Update application.yml

Add:

```id="5px8fi"
jwt:
  secret: your_super_secret_key_here
  expiration: 86400000
```

Use environment variable in production.

---

# 🧠 1️⃣4️⃣ Future-Ready Considerations

Leave structure ready for:

```id="n3y1xo"
infrastructure/security/RefreshTokenService.java
```

For future refresh tokens.

---

# 📋 PHASE 4 COMPLETION CHECKLIST

Your developer must confirm:

✔ JWT login working
✔ Password encrypted
✔ Roles enforced
✔ Industry-level filtering working
✔ Unauthorized requests blocked
✔ Stateless session
✔ Token expiration working

---

# 🔥 After Phase 4

Your system becomes:

✔ Secure
✔ Multi-industry ready
✔ SaaS ready
✔ Production-grade
