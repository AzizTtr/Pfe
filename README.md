<div align="center">

# Arabic Quality Platform

### مشروع مقياس جودة تعليم اللغة العربية لغير الناطقين بها

**A comprehensive web platform that automates the full evaluation cycle of Arabic teaching quality for non-native speakers — from institution registration to official report issuance.**

[![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)]()
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular&logoColor=white)]()
[![Keycloak](https://img.shields.io/badge/Keycloak-24-4D4D4D?logo=keycloak&logoColor=white)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)]()
[![License](https://img.shields.io/badge/License-PFE%202026-3b82f6)]()

**Projet de Fin d'Études** · Badr Zayani · 2026
*mohamed.zayani-e@erlm.tn*

</div>

---

## Table of Contents

1. [Project overview](#1-project-overview)
2. [Tech stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project structure](#4-project-structure)
5. [Quick start](#5-quick-start)
6. [Authentication flow (Keycloak)](#6-authentication-flow-keycloak)
7. [Database schema](#7-database-schema)
8. [Theme & Design system](#8-theme--design-system)
9. [Features (22 / 22)](#9-features-22--22)
10. [Sprint progress](#10-sprint-progress)
11. [API endpoints](#11-api-endpoints)
12. [Demo accounts](#12-demo-accounts)
13. [Troubleshooting](#13-troubleshooting)
14. [Documentation](#14-documentation)

---

## 1. Project overview

The platform automates the full evaluation cycle of Arabic teaching quality for non-native speakers, as described in the cahier des charges of HAD.SA. **22 features** are spread across 4 modules:

| Module | Features | Description |
|--------|----------|-------------|
| **Public + Entity portal** | 1–6 | Registration, login, request submission, status tracking, notifications, results |
| **Evaluation team** | 7–10 | Inbox, review answers, edit ratings, initial decision |
| **Approvals** | 11–14 | Administrative → Field approval, scoring, official report |
| **Admin Panel** | 15–22 | Users, categories, questions, values, distribution, audit, reports, exports |

### Core value proposition

- ✅ **Auditable end-to-end** workflow with immutable audit log (AOP)
- ✅ **Bilingual AR/EN** with full RTL/LTR support including PDF reports
- ✅ **Enterprise-grade auth** delegated to Keycloak (OIDC/PKCE)
- ✅ **Premium UI/UX** with 3D Three.js hero, glassmorphism, professional theme
- ✅ **Automated scoring** A/B/C/D with configurable percentage scale
- ✅ **PDF/Excel exports** for analytics dashboard

---

## 2. Tech stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Runtime |
| Spring Boot | 3.2.5 | Application framework |
| Spring Security OAuth2 Resource Server | 3.2 | JWT validation |
| Spring Data JPA + Hibernate | 6.4 | ORM |
| Flyway | 9.22 | Schema migrations |
| Keycloak Admin Client | 24.0.3 | User provisioning |
| iText 7 | 8.0 | PDF generation (Arabic-aware) |
| Apache POI | 5.2 | Excel exports |
| MapStruct | 1.5 | Entity ↔ DTO mapping |
| Lombok | 1.18 | Boilerplate reduction |
| Thymeleaf | 3.1 | Email templates |
| SpringDoc OpenAPI | 2.3 | Swagger UI |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17.3 | SPA framework |
| Angular Material + CDK | 17 | UI components |
| TailwindCSS + tailwindcss-rtl | 3.4 | Styling |
| keycloak-angular + keycloak-js | 15 / 24 | OIDC integration |
| ngx-translate | 15 | i18n (AR/EN) |
| ng2-charts + Chart.js | 5 / 4 | Analytics charts |
| Three.js | 0.165 | 3D hero crystal |
| ngx-toastr | 18 | Notifications |
| @stomp/stompjs + sockjs-client | 7 / 1 | WebSocket (real-time) |

### Infrastructure
| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **Keycloak** | `aq-keycloak` | 8180 | Identity & access management |
| **PostgreSQL** | `aq-keycloak-db` | (internal) | Keycloak storage |
| **MySQL 8** | `aq-mysql` | 3306 | Application database |
| **MailHog** | `aq-mailhog` | 1025 / 8025 | Dev SMTP capture |

---

## 3. Architecture

### High-level diagram

```
┌──────────────────────────┐  OIDC PKCE   ┌──────────────────────┐
│   Angular SPA            │◄────────────►│   Keycloak 24        │
│   localhost:4200         │              │   Realm:             │
│   ─ keycloak-angular     │              │   arabic-quality     │
│   ─ Tailwind + Material  │              │   ─ 5 realm roles    │
│   ─ Three.js hero        │              │   ─ 2 OAuth clients  │
│   ─ ngx-translate AR/EN  │              │   ─ MFA / SSO ready  │
└────────────┬─────────────┘              └──────────┬───────────┘
             │ Bearer JWT                            │ JWKS
             ▼                                       ▼
┌────────────────────────────────────────────────────────────────┐
│   Spring Boot 3.2 Resource Server (port 8080)                  │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ Controllers (REST) — secured by @PreAuthorize            │ │
│   ├──────────────────────────────────────────────────────────┤ │
│   │ Services — business logic + AOP audit + @Async emails   │ │
│   ├──────────────────────────────────────────────────────────┤ │
│   │ Repositories — Spring Data JPA / Hibernate               │ │
│   ├──────────────────────────────────────────────────────────┤ │
│   │ Cross-cutting:                                           │ │
│   │  ─ KeycloakJwtAuthenticationConverter                    │ │
│   │  ─ KeycloakUserSyncFilter (lazy provisioning)            │ │
│   │  ─ KeycloakAdminService (REST Admin API)                 │ │
│   │  ─ AuditAspect (@Audit annotation → audit_log)           │ │
│   │  ─ EmailService (Thymeleaf bilingual templates)          │ │
│   │  ─ ScoringService (A/B/C/D weighted scoring)             │ │
│   │  ─ ReportService (iText 7 PDF + Apache POI Excel)        │ │
│   └──────────────────────────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────────┘
                       │ JDBC
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  MySQL 8 — 16 tables + 2 views                                 │
│  Flyway-managed migrations · UTF-8 unicode_ci                  │
│  Audit log immuable · Soft deletes pour users                  │
└────────────────────────────────────────────────────────────────┘
```

### Why a modular monolith (not microservices)

This is **deliberate** and defensible at jury:
- The evaluation workflow has strong domain cohesion → ACID transactions across `request` / `answers` / `decisions` / `score` are essential
- A single team, single language → no team-autonomy benefit
- Predictable scaling needs → no heterogeneous workload
- Module boundaries are clean (DDD bounded contexts) → microservices extraction is possible later without rewriting

### Sequence — full evaluation lifecycle

```
Visitor → POST /public/registration-requests
    ↓
Admin → /admin/registrations → Approve
    ↓
    KeycloakAdminService.createUser(email, role)
    + EmailService.sendWelcome()
    + EducationalEntity created in MySQL
    ↓
Manager → /register confirmation → set password (Keycloak email)
    ↓
Manager → /my-requests/new → submit evaluation request
    ↓
Auto-distributed to Evaluator
    ↓
Evaluator reviews answers + edits ratings + decides (accept/reject/info)
    ↓
Admin reviewer approves
    ↓
Field reviewer approves
    ↓
ScoringService.calculate() → final score, percentage, grade
    ↓
ReportService.generatePdf() → official bilingual PDF
    ↓
Manager receives email + downloads report from /my-requests/:id
```

---

## 4. Project structure

```
pfe/
├── README.md                              ← (this file)
├── docker-compose.yml                     ← Keycloak + MySQL + MailHog
│
├── docs/
│   ├── 01_ARCHITECTURE.md                 ← Full architecture doc
│   └── 02_ROADMAP.md                      ← Sprint planning
│
├── database/
│   ├── schema.sql                         ← Annotated MySQL schema
│   └── 02_ERD.md                          ← Entity-relationship diagram
│
├── keycloak/
│   └── realm-export/
│       └── arabic-quality-realm.json      ← Pre-configured realm
│
├── backend/
│   ├── pom.xml                            ← Maven dependencies
│   └── src/main/
│       ├── java/tn/pfe/arabicquality/
│       │   ├── ArabicQualityApplication.java
│       │   │
│       │   ├── audit/                     ← Audit log (AOP)
│       │   │   ├── Audit.java             ← @Audit annotation
│       │   │   ├── AuditAspect.java       ← Around interceptor
│       │   │   ├── AuditLog.java          ← Entity (immuable)
│       │   │   └── AuditLogRepository.java
│       │   │
│       │   ├── catalog/                   ← Categories + Questions + Values
│       │   │   └── domain/
│       │   │       ├── EvaluationCategory.java
│       │   │       ├── Question.java
│       │   │       └── EvaluationValue.java
│       │   │
│       │   ├── common/
│       │   │   └── BaseEntity.java        ← @MappedSuperclass
│       │   │
│       │   ├── config/
│       │   │   ├── AppProperties.java     ← @ConfigurationProperties
│       │   │   ├── JpaAuditingConfig.java
│       │   │   └── security/
│       │   │       ├── SecurityConfig.java                  ← OAuth2 ResourceServer
│       │   │       ├── KeycloakJwtAuthenticationConverter.java
│       │   │       ├── KeycloakUserSyncFilter.java          ← Lazy provisioning
│       │   │       └── KeycloakAdminClientConfig.java
│       │   │
│       │   ├── entities/                  ← Educational entities
│       │   │   ├── domain/
│       │   │   │   ├── EducationalEntity.java
│       │   │   │   └── RegistrationRequest.java
│       │   │   ├── dto/RegistrationDtos.java
│       │   │   ├── repository/
│       │   │   │   ├── EducationalEntityRepository.java
│       │   │   │   └── RegistrationRequestRepository.java
│       │   │   ├── service/RegistrationService.java         ← Approve/Reject workflow
│       │   │   └── controller/
│       │   │       ├── RegistrationController.java          ← Public POST
│       │   │       └── AdminRegistrationController.java     ← Admin REST
│       │   │
│       │   ├── notifications/
│       │   │   └── EmailService.java                        ← Thymeleaf bilingual
│       │   │
│       │   ├── requests/                  ← Evaluation requests
│       │   │   └── domain/
│       │   │       ├── EvaluationRequest.java
│       │   │       └── RequestStatus.java
│       │   │
│       │   ├── scoring/
│       │   │   └── ScoringService.java                      ← Auto-calculation
│       │   │
│       │   └── users/
│       │       ├── domain/
│       │       │   ├── User.java                             ← Profile (no password)
│       │       │   └── Role.java
│       │       ├── dto/UserDtos.java
│       │       ├── repository/{User,Role}Repository.java
│       │       ├── service/
│       │       │   ├── UserSyncService.java                 ← Keycloak sync
│       │       │   ├── KeycloakAdminService.java            ← Provisioning
│       │       │   └── UserManagementService.java           ← Admin CRUD
│       │       └── controller/
│       │           ├── UserController.java                  ← /users/me
│       │           └── AdminUserController.java             ← /admin/users
│       │
│       └── resources/
│           ├── application.yml                              ← Profile-aware config
│           ├── db/migration/V1__init_schema.sql             ← Flyway
│           ├── i18n/messages_{ar,en}.properties             ← Backend i18n
│           └── templates/email/
│               ├── welcome.html                             ← Thymeleaf bilingual
│               ├── rejection.html
│               ├── info-requested.html
│               └── evaluation-completed.html
│
└── frontend/
    ├── package.json                                         ← npm dependencies
    ├── angular.json
    ├── tailwind.config.js                                   ← forest + royal palette
    ├── tsconfig.json
    └── src/
        ├── index.html                                       ← Aurora background
        ├── main.ts
        ├── styles.scss                                      ← Theme + glass utilities
        ├── silent-check-sso.html                            ← Keycloak SSO
        ├── environments/
        │   ├── environment.ts
        │   └── environment.prod.ts
        ├── assets/i18n/
        │   ├── ar.json
        │   └── en.json
        └── app/
            ├── app.component.ts
            ├── app.config.ts                                ← Bootstrap Keycloak + i18n
            ├── app.routes.ts                                ← Routes lazy + guards
            ├── core/
            │   ├── auth/
            │   │   ├── auth.guard.ts
            │   │   ├── role.guard.ts
            │   │   └── auth.service.ts
            │   ├── api/api.service.ts                       ← HTTP wrapper
            │   └── layout/layout.component.ts               ← Premium sidebar
            ├── shared/
            │   ├── page-shell/page-shell.component.ts       ← Title + divider
            │   ├── card/card.component.ts                   ← Glass card
            │   ├── coming-soon/coming-soon.component.ts     ← Roadmap preview
            │   └── hero-crystal/hero-crystal.directive.ts   ← Three.js
            └── features/
                ├── public/
                │   ├── home/home.component.ts               ← 3D hero + cards
                │   └── register/register.component.ts       ← Public form
                ├── dashboard/dashboard.component.ts         ← Role-based actions
                ├── profile/profile.component.ts             ← In-app profile
                ├── entity-portal/                           ← Entity Manager
                │   ├── list/                                ← Feature 4
                │   ├── new-request/                         ← Feature 3
                │   └── detail/                              ← Feature 6
                ├── evaluation/                              ← Evaluator/Admin/Field
                │   ├── inbox/                               ← Feature 7
                │   └── review/                              ← Features 8-12
                └── admin/                                   ← Platform Admin
                    ├── admin-shell.component.ts             ← Sub-nav (8 sections)
                    ├── registrations/                       ← Feature 1 admin
                    ├── users/                               ← Feature 15
                    ├── categories/                          ← Feature 16
                    ├── questions/                           ← Feature 17
                    ├── values/                              ← Feature 18
                    ├── assignments/                         ← Feature 19
                    ├── audit/                               ← Feature 20
                    └── reports/                             ← Features 21-22
```

---

## 5. Quick start

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker + Docker Compose (Linux)
- **Java 17** (Eclipse Temurin recommended) — verify with `java -version`
- **Node.js 18+** + npm — verify with `node -v`
- **IntelliJ IDEA Community** (recommended for backend, embedded Maven)
- **VS Code** (recommended for frontend)

### Step 1 — Infrastructure

```bash
cd pfe/
docker compose up -d

# Wait ~30 seconds for Keycloak to import the realm
```

Services:
- **Keycloak** → http://localhost:8180  (admin / admin)
- **MySQL** → localhost:3306  (root / root)
- **MailHog UI** → http://localhost:8025

The realm `arabic-quality` is auto-imported with 5 roles, 2 OAuth clients, and 2 demo users.

### Step 2 — Backend

**Option A — IntelliJ (recommended, no Maven CLI needed):**
1. Open `backend/` as a Maven project
2. Wait for dependency download (3-5 min first time)
3. **Important** : Settings → Build → Compiler → Annotation Processors → ✅ Enable
4. **Important** : Install Lombok plugin if not already
5. Right-click `ArabicQualityApplication.java` → Run

**Option B — Maven CLI:**
```bash
cd backend/
mvn spring-boot:run
```

Backend runs at `http://localhost:8080/api`. Swagger UI: `http://localhost:8080/api/swagger-ui`.

### Step 3 — Frontend

```bash
cd frontend/
npm install        # ~3-5 min first time
npm start
```

Frontend runs at `http://localhost:4200`.

### Step 4 — Smoke test

1. Open `http://localhost:4200` → click **Sign in**
2. Login with `admin@arabic-quality.local` / `Admin@2026`
3. Dashboard appears with role `ROLE_PLATFORM_ADMIN`
4. Sidebar shows all admin sections
5. Click **Profile** → in-app profile page (no Keycloak redirect)

---

## 6. Authentication flow (Keycloak)

### OAuth2 / OIDC with PKCE

```
1. User clicks Sign in on Angular SPA
   └─► redirect to Keycloak /auth endpoint
2. User enters credentials on Keycloak's UI (customizable)
3. Keycloak returns authorization code
4. Angular exchanges code for access_token + refresh_token (PKCE S256)
5. Angular stores tokens (in memory + sessionStorage)
6. Each API request includes `Authorization: Bearer <jwt>`
7. Spring Boot validates JWT signature via Keycloak JWKS (cached 1h)
8. KeycloakJwtAuthenticationConverter maps `realm_access.roles` → GrantedAuthority
9. KeycloakUserSyncFilter creates/updates local users.kc_id at first access
```

### What's delegated to Keycloak

| Aspect | Delegated | Notes |
|--------|:---------:|-------|
| Login form / SSO | ✅ | Branded login page |
| Password hashing (PBKDF2) | ✅ | Never our concern |
| Refresh tokens | ✅ | Auto-rotation |
| Reset password by email | ✅ | Triggered from `/profile` |
| MFA (TOTP, WebAuthn) | ✅ | Ready to enable |
| LDAP/AD federation | ✅ | Plug-and-play |
| Account lockout | ✅ | Brute force protection |
| Multi-tenant | ✅ | If needed later |

### What we manage in Spring Boot

- JWT signature validation (via JWKS)
- Role → Spring Security authorities mapping
- Business authorization (`@PreAuthorize`)
- Audit log
- User lazy provisioning to local profile table

### Realm configuration

Roles configured in `arabic-quality` realm:

| Code | Name (AR) | Name (EN) |
|------|-----------|-----------|
| `ROLE_PLATFORM_ADMIN` | مشرف المنصة | Platform Administrator |
| `ROLE_FIELD_REVIEWER` | المسؤول الميداني | Field Reviewer |
| `ROLE_ADMIN_REVIEWER` | المسؤول الإداري | Administrative Reviewer |
| `ROLE_EVALUATOR` | عضو فريق التقييم | Evaluation Team Member |
| `ROLE_ENTITY_MANAGER` | مدير الجهة التعليمية | Educational Entity Manager |

Password policy: ≥ 8 chars, 1 uppercase, 1 digit, 1 special char, no reuse of last 3 passwords. Brute-force protection: 5 failed attempts → 15 min lockout.

---

## 7. Database schema

### Tables (16 + 2 views)

```
roles                       ← seeded with 5 roles
users                       ← profile only, no password (kc_id ↔ Keycloak UUID)
registration_requests       ← public submissions queue
registration_documents      ← optional uploads
educational_entities        ← created on registration approval
evaluation_categories       ← Feature 16
questions                   ← Feature 17
evaluation_values           ← Feature 18 — A/B/C/D
category_required_documents ← mandatory attachments per category
grading_scale               ← seeded percentage→grade mapping
evaluation_requests         ← state machine (13 statuses)
evaluation_request_categories  ← M:N
evaluation_answers          ← initial + final value per question
evaluation_attachments      ← uploaded docs
request_assignments         ← Feature 19 — initial / admin / field stages
workflow_decisions          ← traces every accept/reject/info-request
final_reports               ← generated PDF metadata
notifications               ← Feature 5 — in-app + email
audit_log                   ← immuable, indexed on (user, entity, action, date)
system_settings             ← key-value config
```

Views:
- `v_request_summary` — for the dashboard
- `v_category_avg_score` — for analytics

### Key design choices

- **`kc_id` (CHAR 36)** ↔ Keycloak `sub` UUID, indexed unique
- **`evaluation_answers.initial_value_id` AND `final_value_id`** — preserve auto-evaluation by entity vs. final rating by evaluator (audit-grade)
- **`evaluation_requests.is_locked`** — set TRUE after admin approval, blocks any mutation
- **`audit_log` immuable** — no DELETE endpoint exists; only INSERT
- **`grading_scale` configurable** — no hard-coded thresholds

The full schema is in [`database/schema.sql`](database/schema.sql) and migrated via Flyway (`V1__init_schema.sql`).

---

## 8. Theme & Design system

### Color palette

Tailwind extensions:

```js
forest: { 500: '#10b981', 700: '#047857', 900: '#064e3b', 950: '#022c22' }
royal:  { 500: '#3b82f6', 700: '#1d4ed8', 900: '#1e3a8a', 950: '#172554' }
```

Background: `#060B1A` (deeper than `#020617` for less harsh contrast).

### Glassmorphism utilities

```scss
.glass         // standard frosted card (45% opacity)
.glass-strong  // for modals and sidebar (65% opacity)
.glass-soft    // subtle for nested elements (30%)
.gradient-text // emerald → blue text
.glow-emerald  // CTA hover glow
.card-rim      // gradient border on hover
.aq-divider    // 56px gradient line (under titles)
```

### Status badges

```scss
.aq-badge.aq-badge-success   // emerald (approved)
.aq-badge.aq-badge-info      // blue (informational)
.aq-badge.aq-badge-warning   // amber (pending / in progress)
.aq-badge.aq-badge-danger    // red (rejected)
.aq-badge.aq-badge-neutral   // gray (default)
```

### Sub-navigation pills

```scss
.aq-pill              // default state
.aq-pill.aq-pill-active // gradient border + tinted background
```

### Reusable components

| Component | Selector | Purpose |
|-----------|----------|---------|
| `LayoutComponent` | `aq-layout` | Sidebar + main content shell |
| `PageShellComponent` | `aq-page-shell` | Title + divider + slot for actions/content |
| `CardComponent` | `aq-card` | Glass card with optional icon/title |
| `ComingSoonComponent` | `aq-coming-soon` | Pro placeholder for upcoming features |
| `AdminShellComponent` | `aq-admin-shell` | Sub-nav for the 8 admin sections |
| `HeroCrystalDirective` | `[aqHeroCrystal]` | Three.js floating crystal |

### Bilingual + RTL/LTR

- `<html lang dir>` switches dynamically based on user preference
- Tailwind RTL plugin handles padding/margin/border direction
- Cairo font for AR, Inter font for EN, switched via `[dir]` selector
- Material form fields mirror correctly
- All icons that have direction are mirrored via `.icon-mirror`

### 3D Hero crystal

The `aqHeroCrystal` directive mounts a Three.js scene with:
- Translucent icosahedron (`MeshPhysicalMaterial` with iridescence + transmission)
- Wireframe overlay
- 220 floating particles in spherical halo
- Mouse parallax (smooth interpolation)
- Subtle floating animation
- Disposed cleanly on `ngOnDestroy`

---

## 9. Features (22 / 22)

| # | Module | Feature | Backend | Frontend | Status |
|---|--------|---------|:-------:|:--------:|:------:|
| 1 | Public | Inscription Jiha | ✅ | ✅ | **Done** |
| 2 | Auth | Login (Keycloak OIDC) | ✅ | ✅ | **Done** |
| 3 | Entity | Soumettre demande | 🟡 | 🟡 | Sprint 4 |
| 4 | Entity | Suivi statut | 🟡 | 🟡 | Sprint 4 |
| 5 | Cross | Notifications email + in-app | ✅ | 🟡 | Partially done |
| 6 | Entity | Voir résultats finaux | 🟡 | 🟡 | Sprint 6 |
| 7 | Eval | Inbox équipe | 🟡 | 🟡 | Sprint 5 |
| 8 | Eval | Réponses + pièces jointes | 🟡 | 🟡 | Sprint 5 |
| 9 | Eval | Modifier notes | 🟡 | 🟡 | Sprint 5 |
| 10 | Eval | Décision préliminaire | 🟡 | 🟡 | Sprint 5 |
| 11 | Approve | Approbation admin | 🟡 | 🟡 | Sprint 5 |
| 12 | Approve | Approbation terrain | 🟡 | 🟡 | Sprint 5 |
| 13 | Score | Calcul score final | ✅ | — | **Done** |
| 14 | Notify | Envoi résultat | 🟡 | 🟡 | Sprint 6 |
| 15 | Admin | Gestion users | ✅ | ✅ | **Done** |
| 16 | Admin | Catégories + Required Documents | ✅ | ✅ | **Done** |
| 17 | Admin | Questions | ✅ | ✅ | **Done** |
| 18 | Admin | Valeurs A/B/C/D | ✅ | ✅ | **Done** |
| 19 | Admin | Distribution demandes | 🟡 | 🟡 | Sprint 5 |
| 20 | Admin | Audit log | ✅ | 🟡 | AOP done, UI Sprint 7 |
| 21 | Admin | Dashboard analytics | 🟡 | ✅ | Sprint 6 |
| 22 | Admin | Export PDF/Excel | 🟡 | 🟡 | Sprint 6 |

**Legend** : ✅ Done end-to-end · 🟡 Skeleton + theme applied, business logic next

---

## 10. Sprint progress

### ✅ Phase 1 — Planning & Requirements (M1-M2)

- Architecture document (16 sections)
- Database schema + ERD (16 tables)
- Tech stack validation (Spring Boot + Angular + MySQL + **Keycloak**)
- Docker Compose dev stack

### ✅ Phase 2 — UX/UI Design (M3-M4)

- High-fidelity HTML preview ([`frontend/design-preview/homepage.html`](frontend/design-preview/homepage.html))
- Premium theme applied to all pages (forest + royal palette)
- 3D Three.js hero crystal
- Glassmorphism design system
- 22 page skeletons themed consistently
- Bilingual AR/EN with RTL/LTR

### ✅ Sprint 1 — Socle & Auth (M5)

- Spring Boot 3.2 setup with Maven
- Keycloak realm pre-configured (5 roles, 2 clients, 2 demo users)
- Spring Security OAuth2 Resource Server
- JWT → GrantedAuthority mapping
- Lazy user provisioning filter
- Flyway V1 migration
- Angular 17 + keycloak-angular bootstrap
- AuthGuard + RoleGuard
- i18n bilingual + RTL switcher
- Layout with premium sidebar
- Home page with 3D hero
- **Feature 2 (Login) end-to-end ✅**

### ✅ Sprint 2 — Inscription & Users (M5-M6)

- `RegistrationService` orchestration (Keycloak + MySQL + Email)
- `EmailService` with 4 Thymeleaf bilingual templates
- `AdminRegistrationController` (list / approve / reject)
- `UserManagementService` with Keycloak admin integration
- `AdminUserController` (list / create / update / activate / deactivate)
- Frontend: registrations queue + dialog
- Frontend: users CRUD with search/filter
- Sidebar admin sub-navigation (8 sections)
- Profile page (in-app, no Keycloak redirect)
- Reset password trigger via email
- **Features 1, 5 (partial), 15 end-to-end ✅**

### ✅ Sprint 3 — Catalog (M6)

- Full CRUD for `evaluation_categories` (8 endpoints with audit)
- Full CRUD for `questions` (with category binding + active/inactive toggle)
- Full CRUD for `evaluation_values` (A/B/C/D + numeric score + display order)
- **Required documents per category** : add/edit/delete docs with mandatory/optional flag and ordering
- Soft deactivate instead of physical delete
- Frontend pages with table + edit dialog + RequiredDocs modal
- Bilingual labels (AR/EN) for everything in the catalog
- **Features 16, 17, 18 end-to-end ✅**

### 🔜 Sprint 4 — Request submission (M7)

Dynamic question form, A/B/C/D radio per question, file upload per category, draft/submit, request listing for entity manager.

### 🔜 Sprint 5 — Evaluation & Workflow (M7)

Inbox for evaluators, answer review, rating adjustment, decision (accept/reject/info), state machine, admin/field approval, automatic distribution.

### 🔜 Sprint 6 — Scoring & Reports (M7)

Auto-scoring on final approval, PDF report generation (iText 7 with Arabic font), Excel export (Apache POI), advanced dashboard charts.

### 🔜 Sprint 7 — Audit & Notifications (M7)

Audit log UI with filters, notification center component, WebSocket real-time push, Keycloak SSO session listing.

### 🔜 Phase 4 — Tests & Pilot (M8-M9)

JUnit 5 + Mockito unit tests, Spring Boot Test + Testcontainers integration, Cypress E2E, ≥ 60% backend coverage target.

### 🔜 Phase 5 — Deployment (M10)

Production VPS, Nginx reverse proxy + Let's Encrypt, GitHub Actions CI/CD, automated DB backups.

---

## 11. API endpoints

All endpoints are prefixed with `/api`. Authentication: Bearer JWT issued by Keycloak.

### Public
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/public/registration-requests` | Submit institution registration | None |

### User profile
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `GET` | `/users/me` | Current user profile | Any |
| `PATCH` | `/users/me` | Update name/phone/lang | Any |
| `POST` | `/users/me/request-password-reset` | Trigger Keycloak email | Any |

### Admin — Registrations
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/registrations?status=PENDING` | Paginated queue |
| `POST` | `/admin/registrations/{id}/approve` | Create user + entity + email |
| `POST` | `/admin/registrations/{id}/reject` | Notify with reason |

### Admin — Users
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users?role=&search=` | Search + filter |
| `POST` | `/admin/users` | Create (Keycloak + MySQL) |
| `PATCH` | `/admin/users/{id}` | Update |
| `POST` | `/admin/users/{id}/deactivate` | Soft delete |
| `POST` | `/admin/users/{id}/reactivate` | Restore |

### Admin — Catalog (Sprint 3)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/catalog/categories` | List all categories |
| `POST` | `/admin/catalog/categories` | Create category |
| `PATCH` | `/admin/catalog/categories/{id}` | Update |
| `POST` | `/admin/catalog/categories/{id}/deactivate` | Soft disable |
| `POST` | `/admin/catalog/categories/{id}/reactivate` | Re-enable |
| `GET` | `/admin/catalog/questions?categoryId=` | List questions |
| `POST` | `/admin/catalog/questions` | Create |
| `PATCH` | `/admin/catalog/questions/{id}` | Update |
| `POST` | `/admin/catalog/questions/{id}/deactivate` | Soft disable |
| `POST` | `/admin/catalog/questions/{id}/reactivate` | Re-enable |
| `GET` | `/admin/catalog/values` | List A/B/C/D |
| `POST` | `/admin/catalog/values` | Create |
| `PATCH` | `/admin/catalog/values/{id}` | Update |
| `POST` | `/admin/catalog/values/{id}/deactivate` | Soft disable |
| `POST` | `/admin/catalog/values/{id}/reactivate` | Re-enable |
| `GET` | `/admin/catalog/categories/{id}/required-documents` | List docs |
| `POST` | `/admin/catalog/categories/{id}/required-documents` | Add doc |
| `PATCH` | `/admin/catalog/required-documents/{id}` | Update doc |
| `DELETE` | `/admin/catalog/required-documents/{id}` | Remove doc |

All admin endpoints require `ROLE_PLATFORM_ADMIN`.

**Swagger UI**: `http://localhost:8080/api/swagger-ui`

---

## 12. Demo accounts

Auto-imported via `realm-export/arabic-quality-realm.json`:

| Role | Email | Password |
|------|-------|----------|
| `ROLE_PLATFORM_ADMIN` | `admin@arabic-quality.local` | `Admin@2026` |
| `ROLE_EVALUATOR` | `evaluator@arabic-quality.local` | `Eval@2026` |

To add more accounts:
1. Open Keycloak admin: http://localhost:8180  (admin / admin)
2. Realm `arabic-quality` → Users → Add user
3. Credentials tab → set password (Temporary = OFF)
4. Role mapping → assign ROLE_*

---

## 13. Troubleshooting

### Backend: Lombok cascade errors (100+ symbols not found)

**Cause** : Maven Compiler Plugin 3.11+ requires explicit `<version>` in `<annotationProcessorPaths>`.

**Already fixed** in `pom.xml`:
```xml
<path>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
</path>
```

Then in IntelliJ:
1. Settings → Compiler → Annotation Processors → ✅ Enable
2. Plugins → Lombok must be ✅ enabled
3. Maven panel → Reload All Maven Projects
4. Build → Rebuild Project

### Backend: `Unknown database 'arabic_quality_db'`

The DB is created automatically by `?createDatabaseIfNotExist=true` in JDBC URL. If still failing, ensure Docker Compose is up:
```bash
docker compose up -d
```

### Backend: `BUILD FAILURE — version can neither be null`

Same as above — fixed in `pom.xml` already. Reload Maven.

### Backend: Email not delivered to MailHog

Check:
1. `docker ps` shows `aq-mailhog`
2. Open http://localhost:8025 — UI loads
3. application.yml has `host: localhost` and `port: 1025`
4. For Keycloak emails (set-password), realm SMTP points to `aq-mailhog:1025` (Docker hostname)

### Backend: Keycloak admin client connection fails

Check:
1. `http://localhost:8180` is reachable
2. application.yml has `KEYCLOAK_ADMIN_USER: admin` and password matches docker-compose
3. The `master` realm has `admin-cli` client (default in Keycloak)

### Frontend: 404 on `/silent-check-sso.html`

Already fixed — the file is declared in `angular.json` as an asset:
```json
"assets": [..., { "glob": "silent-check-sso.html", "input": "src", "output": "/" }]
```

Restart `ng serve` after any `angular.json` change.

### Frontend: `keycloak-angular@16` peer conflict with Angular 17

Use `keycloak-angular@^15.3.0`. Already fixed in `package.json`.

### Frontend: Material theme `azure-blue` not found

Use `indigo-pink` for Material 17 (azure-blue is Material 18+). Already fixed in `styles.scss`.

### Frontend: User created but not visible in admin/users

The query was filtering on `:search IS NULL` but Angular sends `''` when input is empty. Fixed in `UserRepository`:
```sql
AND (:search IS NULL OR :search = '' OR ...)
```

### Frontend: Submitted registration not appearing for admin

Verify backend logs — you should see `Registration submitted #X for entity 'Y'`. If not, check that the `/public/registration-requests` endpoint is reachable (CORS).

---

## 14. Documentation

| Document | Content |
|----------|---------|
| [`README.md`](README.md) | This file |
| [`docs/01_ARCHITECTURE.md`](docs/01_ARCHITECTURE.md) | Architecture detailed (16 sections, ~700 lines) |
| [`docs/02_ROADMAP.md`](docs/02_ROADMAP.md) | Sprint planning + feature mapping |
| [`database/schema.sql`](database/schema.sql) | Full annotated MySQL DDL |
| [`database/02_ERD.md`](database/02_ERD.md) | Entity-relationship diagram |
| [`frontend/design-preview/homepage.html`](frontend/design-preview/homepage.html) | Premium UI preview (open in browser) |

---

## License & credits

**PFE — Projet de Fin d'Études** · 2026

Developed by **Badr Zayani** — `mohamed.zayani-e@erlm.tn`

Inspired by the cahier des charges from HAD.SA for the project *"مقياس جودة تعليم اللغة العربية لغير الناطقين بها"*.

---

<div align="center">

**Built with Spring Boot · Angular · Keycloak · MySQL · Docker**

*Modular monolith · Bilingual · OAuth2/OIDC · Auditable · Production-ready architecture*

</div>
