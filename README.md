# Arabic Quality Platform

Arabic Quality Platform is a full-stack web application for managing the quality evaluation workflow of Arabic-language teaching institutions. It covers institution registration, request submission, evaluator review, admin and field approval, scoring, reporting, audit logging, notifications, analytics, and AI-assisted insights.

The project is built as a modular monolith with Spring Boot, Angular, Keycloak, MySQL, Flyway, Docker Compose, and a bilingual Arabic/English frontend with RTL/LTR support.

---

## Current Status

The application is functionally advanced and demo-ready.

Completed:

- Public registration flow
- Keycloak login and role-based access
- Admin registration approval/rejection
- User management
- Evaluation catalog with 15 categories and 5 questions per category
- Request creation, draft save, submit, and tracking
- Evaluator inbox and request review
- Workflow decisions: initial evaluation, admin review, field review
- Request distribution screen
- Scoring and final request reports
- Admin analytics reports with PDF and Excel export
- Audit log with filters
- In-app notifications and WebSocket setup
- Role-specific home/dashboard pages
- Top 10 institution leaderboard
- Profile personalization
- AI report generator
- AI evaluation assistant
- AI dashboard insights
- AI fraud/risk detection
- Floating AI chatbot/co-pilot
- Arabic/English translation cleanup for the frontend
- Demo seed data for admin, institution, evaluator, reports, audit, and workflow screens

Still recommended before final production deployment:

- Add automated backend and frontend tests
- Persist generated final report files in `final_reports` for long-term archive
- Add admin controls to re-issue final reports
- Finish production deployment setup: Nginx, HTTPS, CI/CD, backups
- Run a full manual QA pass on all role workflows after a fresh database reset

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Backend runtime |
| Spring Boot 3.2.5 | REST API and business logic |
| Spring Security OAuth2 Resource Server | JWT validation |
| Keycloak Admin Client | User provisioning |
| Spring Data JPA / Hibernate | Persistence |
| Flyway | Database migrations |
| MySQL 8 | Application database |
| iText 7 | PDF generation |
| Apache POI | Excel export |
| Thymeleaf | Email templates |
| SpringDoc OpenAPI | Swagger UI |
| WebSocket/STOMP | Live notifications |

### Frontend

| Technology | Purpose |
|---|---|
| Angular 17 | Single-page application |
| Tailwind CSS | Styling |
| Angular Material / CDK | UI helpers |
| ngx-translate | Arabic/English translations |
| keycloak-angular / keycloak-js | OIDC login |
| Chart.js / ng2-charts | Analytics charts |
| Three.js | Public visual experience |
| ngx-toastr | Toast notifications |
| SockJS / STOMP | Live notification client |

### Infrastructure

| Service | Port | Purpose |
|---|---:|---|
| Angular dev server | 4200 | Frontend |
| Spring Boot API | 8080 | Backend API |
| Keycloak | 8180 | Identity provider |
| MySQL | 3306 | App database |
| MailHog SMTP | 1025 | Dev email SMTP |
| MailHog UI | 8025 | Email preview |

---

## Quick Start

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts Keycloak, MySQL, and MailHog.

### 2. Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend API:

```text
http://localhost:8080/api
```

Swagger UI:

```text
http://localhost:8080/api/swagger-ui
```

### 3. Start frontend

```bash
cd frontend
npm install
npm start
```

Frontend:

```text
http://localhost:4200
```

---

## Demo Accounts

These accounts are imported by the Keycloak realm export.

| Role | Email | Password |
|---|---|---|
| Platform admin | `admin@arabic-quality.local` | `Admin@2026` |
| Evaluator | `evaluator@arabic-quality.local` | `Eval@2026` |

Additional demo data is seeded in MySQL with `@demo.local` users and institutions.

---

## Role Pages

### Public

- `/home`
- `/register`

### Institution Manager

- `/dashboard`
- `/my-requests`
- `/my-requests/new`
- `/my-requests/:id`
- `/profile`

### Evaluator

- `/dashboard`
- `/evaluation`
- `/evaluation/requests/:id`
- `/profile`

### Platform Admin

- `/dashboard`
- `/admin/dashboard`
- `/admin/registrations`
- `/admin/users`
- `/admin/categories`
- `/admin/questions`
- `/admin/values`
- `/admin/assignments`
- `/admin/audit`
- `/admin/reports`
- `/profile`

---

## Main Features

### Registration and Users

- Public institution registration form
- Admin approval and rejection
- Keycloak user creation
- Welcome and reset-password emails
- User management with activation/deactivation
- Lazy local profile sync from Keycloak login

### Catalog

- 15 evaluation categories
- 5 simple questions per category
- Required documents per category
- A/B/C/D evaluation values
- Bilingual labels and descriptions
- Active/inactive management

### Evaluation Requests

- Institution request draft creation
- Dynamic categories and questions from the database
- Required document uploads
- Submit into workflow
- Request list and detail tracking
- Final report download for completed requests

### Workflow

- Evaluator inbox
- Initial evaluation review
- Admin review
- Field review
- Approve, reject, or request more information
- Manual request distribution
- Automatic stage movement
- Final scoring after completion

### Reports and Analytics

- Live admin report dashboard
- Registration status analytics
- Evaluation status analytics
- Catalog resource coverage
- User role distribution
- Average score by category
- PDF export
- Excel export
- Public Top 10 institution leaderboard

### Audit and Notifications

- AOP audit logging for sensitive operations
- Filterable audit log page
- In-app notification center
- WebSocket/STOMP notification push
- Email notifications for workflow events

### AI Features

The app includes rule-based AI-style assistance that reads live project data.

- **AI Report Generator**: summarizes a request, strengths, weaknesses, recommendations, fraud/risk alerts, and conclusion.
- **AI Evaluation Assistant**: helps evaluators inspect answers, risks, suggested decisions, and reviewer notes.
- **AI Dashboard Insights**: summarizes platform metrics, highlights, risks, and recommended admin actions.
- **AI Fraud / Risk Detection**: detects repeated copied answers, weak evidence, missing mandatory documents, and unusually high scores with limited proof.
- **AI Chatbot / Co-Pilot**: floating assistant that explains pages, guides navigation, summarizes requests, explains workflow statuses, and adapts to Arabic/English.

---

## Sprint Progress

| Sprint | Scope | Status |
|---|---|---|
| Planning | Architecture, schema, ERD, Docker stack | Complete |
| Sprint 1 | Auth, Keycloak, Angular shell, guards, i18n | Complete |
| Sprint 2 | Registration, admin approval, users, profile | Complete |
| Sprint 3 | Catalog: categories, questions, values, documents | Complete |
| Sprint 4 | Institution request creation and tracking | Complete |
| Sprint 5 | Evaluation workflow and request distribution | Complete |
| Sprint 6 | Scoring, reports, PDF/Excel exports | Mostly complete |
| Sprint 7 | Audit log, notifications, WebSocket events | Complete |
| Sprint 8 | UI polish, role homes, leaderboard, chatbot | Complete |
| Translation pass | Arabic/English cleanup across frontend | Complete |

### What Is Fully Completed

- Sprints 1, 2, 3, 4, 5, 7, and 8 are complete for demo and functional use.
- Sprint 6 is usable and mostly complete: scoring, report views, admin reports, PDF export, and Excel export are implemented.

### Remaining Work

- Persist generated official reports into `final_reports`.
- Add report re-generation/re-issue tools for admins.
- Add automated tests and CI checks.
- Improve final Arabic PDF typography if production-level PDF rendering is required.
- Prepare deployment and backup strategy.

---

## Database Migrations

Flyway migrations seed the project with enough data to make dashboards and role pages readable immediately.

| Migration | Purpose |
|---|---|
| `V1__init_schema.sql` | Core schema, roles, users, values, grading scale |
| `V2__seed_sprint4_catalog.sql` | Starter categories, questions, required documents |
| `V3__seed_demo_business_data.sql` | Demo institutions, requests, assignments, decisions |
| `V4__add_user_profile_personalization.sql` | Profile fields and preferences |
| `V5__expand_evaluation_catalog.sql` | 15 categories with 5 questions each |
| `V6__seed_large_demo_dataset.sql` | Large dashboard/report demo dataset |
| `V7__seed_sprint7_demo_activity.sql` | Notifications and audit demo activity |
| `V8__seed_evaluator_demo_requests.sql` | Evaluator inbox demo scenarios |
| `V9__seed_real_evaluator_inbox_demos.sql` | Requests assigned to `evaluator@arabic-quality.local` |

After adding migrations, restart the backend so Flyway applies them.

---

## API Summary

All backend endpoints are prefixed with:

```text
/api
```

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/public/registration-requests` | Submit institution registration |
| `GET` | `/public/leaderboard/institutions` | Top institutions leaderboard |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users/me` | Current profile |
| `PATCH` | `/users/me` | Update profile and preferences |
| `POST` | `/users/me/request-password-reset` | Trigger Keycloak reset email |

### Requests

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/requests/catalog` | Active catalog for new request |
| `GET` | `/requests/mine` | Current institution requests |
| `GET` | `/requests/{id}` | Request detail |
| `POST` | `/requests` | Create request draft |
| `PATCH` | `/requests/{id}` | Update request draft |
| `POST` | `/requests/{id}/attachments` | Upload document |
| `POST` | `/requests/{id}/submit` | Submit request |
| `GET` | `/requests/{id}/report/pdf` | Download request PDF report |
| `GET` | `/requests/{id}/ai-report?lang=ar|en` | AI request report |

### Evaluation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/evaluation/requests` | Evaluator/reviewer inbox |
| `GET` | `/evaluation/requests/{id}` | Workflow detail |
| `PATCH` | `/evaluation/answers/{answerId}` | Update final rating/note |
| `POST` | `/evaluation/requests/{id}/decision` | Submit workflow decision |
| `GET` | `/evaluation/requests/{id}/ai-assistant` | AI evaluation assistant |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/registrations` | Registration queue |
| `POST` | `/admin/registrations/{id}/approve` | Approve registration |
| `POST` | `/admin/registrations/{id}/reject` | Reject registration |
| `GET` | `/admin/users` | User list |
| `POST` | `/admin/users` | Create user |
| `PATCH` | `/admin/users/{id}` | Update user |
| `GET` | `/admin/catalog/categories` | Categories |
| `GET` | `/admin/catalog/questions` | Questions |
| `GET` | `/admin/catalog/values` | Values |
| `GET` | `/admin/assignments` | Assignments |
| `POST` | `/admin/assignments` | Assign request |
| `GET` | `/admin/audit-log` | Audit log |
| `GET` | `/admin/reports/dashboard` | Live report dashboard |
| `GET` | `/admin/reports/export/pdf` | Export reports PDF |
| `GET` | `/admin/reports/export/excel` | Export reports Excel |
| `GET` | `/admin/reports/ai-insights` | AI dashboard insights |

---

## Translation / i18n

The frontend supports:

- Arabic and English
- RTL and LTR direction switching
- Page titles, menus, buttons, forms, statuses, chatbot messages, AI panels, audit filters, and workflow labels
- Cleaned Arabic translation file with no `????` placeholders or mojibake text
- English translation file checked to contain no Arabic text

Translation files:

```text
frontend/src/assets/i18n/ar.json
frontend/src/assets/i18n/en.json
```

---

## Verification Notes

Recently verified:

```bash
cd frontend
npm run build
```

The frontend production build passes.

Backend compile was not verified in this environment because Maven is not installed on the machine used for the latest changes.

---

## Troubleshooting

### Demo data does not appear

Restart the backend so Flyway applies the latest migrations.

```bash
cd backend
mvn spring-boot:run
```

### Evaluator inbox is empty

Use:

```text
evaluator@arabic-quality.local
Eval@2026
```

The `V9` migration assigns demo requests to that real Keycloak evaluator account.

### Arabic still shows old text

Hard refresh the browser after frontend changes:

```text
Ctrl + F5
```

Also restart `ng serve` if the translation file changed.

### Mail does not appear

Open MailHog:

```text
http://localhost:8025
```

Check that Docker containers are running.

### Swagger

```text
http://localhost:8080/api/swagger-ui
```

---

## Project Structure

```text
pfe/
  backend/
    src/main/java/tn/pfe/arabicquality/
      ai/
      audit/
      catalog/
      config/
      entities/
      notifications/
      reports/
      requests/
      scoring/
      users/
    src/main/resources/db/migration/
  frontend/
    src/app/
      core/
      features/
      shared/
    src/assets/i18n/
  keycloak/
    realm-export/
  database/
  docs/
  docker-compose.yml
  README.md
```

---

## Credits

PFE 2026 - Arabic Quality Platform.

Built with Spring Boot, Angular, Keycloak, MySQL, Docker, Tailwind CSS, and a modular monolith architecture.
