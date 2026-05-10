# Roadmap de Développement

> Découpage en sprints suivant le calendrier 15 mois du cahier des charges (page 7 du PDF).
> Chaque phase liste les fonctionnalités à coder, les modules backend/frontend, et les livrables.

## Vue d'ensemble — Diagramme de Gantt simplifié

```
M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12 M13 M14 M15
█   █                                                            Planification & Recueil
        █   █                                                    Conception UX/UI
                █   █   █                                        Développement
                            █   █                                Tests & Pilote
                                    █   █   █   █   █   █   █    Déploiement & Évolution
```

---

## Phase 1 — Planification & Recueil des besoins (M1–M2)

**Objectif** : valider le cahier des charges et figer l'architecture.

### Livrables
- ✅ Document d'architecture (`docs/01_ARCHITECTURE.md`)
- ✅ Modèle de données + schéma SQL (`database/schema.sql`, `database/02_ERD.md`)
- ✅ Choix de stack validé (Spring Boot + Angular + MySQL + **Keycloak**)
- ✅ Setup Docker Compose (Keycloak, MySQL, MailHog)
- Maquettes basse fidélité (wireframes) — Figma ou équivalent
- Backlog des 22 features priorisé

### Tâches
- Recueil des besoins fonctionnels avec encadrant pédagogique
- Étude comparative des solutions existantes
- Rédaction du document de spécifications fonctionnelles

---

## Phase 2 — Conception UX/UI (M3–M4)

**Objectif** : produire des maquettes haute fidélité bilingues (RTL/LTR) pour tous les écrans.

### Livrables
- Maquettes Figma pour chaque rôle :
  - Espace public (accueil, inscription Jiha)
  - Portail institution (tableau de bord, formulaire de demande, suivi)
  - Espace évaluateur (inbox, fiche de revue, notes)
  - Approbation administrative & terrain
  - Admin Panel complet (7 sections)
- Charte graphique : palette, typographie (Cairo pour AR, Roboto pour EN), iconographie
- Système de design (boutons, formulaires, cartes, modals)

---

## Phase 3 — Développement (M5–M7)

### Sprint 1 — Socle & Authentification (M5)
**Backend** :
- Setup projet Spring Boot 3.2 + Maven (`pom.xml`, structure packages)
- Configuration Keycloak (realm `arabic-quality`, 5 rôles, clients SPA + bearer)
- Spring Security OAuth2 Resource Server
- `KeycloakJwtAuthenticationConverter` (mapping rôles)
- `KeycloakUserSyncFilter` + `UserSyncService` (lazy provisioning)
- Migrations Flyway V1 (schéma initial)
- Endpoint `/users/me`

**Frontend** :
- Setup Angular 17 + keycloak-angular + Material + Tailwind
- AppConfig (`APP_INITIALIZER` Keycloak, intercepteur Bearer)
- Layout (toolbar + menu profil + switch langue)
- Routes & Guards (AuthGuard, RoleGuard)
- i18n bilingue (ar.json, en.json) + bascule RTL/LTR
- Page d'accueil

**Features couvertes** : 2 (Login)

### Sprint 2 — Inscription & Gestion utilisateurs (M5–M6)
**Backend** :
- `RegistrationController` (POST public)
- `RegistrationRequestService` (workflow approve/reject)
- `KeycloakAdminService` (provisioning user à l'approbation)
- Création automatique `EducationalEntity`
- Service de notification email (templates Thymeleaf)
- Endpoints admin `/admin/users` (Feature 15)

**Frontend** :
- Formulaire `register` (public)
- Section admin "registration-requests" (queue à approuver/rejeter)
- Section admin "users" (liste, création, activation/désactivation)

**Features couvertes** : 1, 5 (notifications), 15

### Sprint 3 — Catalogue (M6)
**Backend** :
- CRUD `evaluation_categories`, `questions`, `evaluation_values`
- Endpoints admin avec validation
- Soft-deactivate au lieu de delete physique si déjà utilisé
- Gestion `category_required_documents`

**Frontend** :
- Sections admin : categories, questions, values
- Formulaires bilingues (champs ar/en côte à côte)

**Features couvertes** : 16, 17, 18

### Sprint 4 — Soumission de demandes & workflow début (M7)
**Backend** :
- `EvaluationRequestService` (DRAFT → PENDING_REVIEW)
- `EvaluationAnswer` + valeurs initiales
- `EvaluationAttachment` + `FileStorageService` (local) — Feature 8
- Endpoint POST `/requests` (depuis Jiha)
- Endpoint GET `/requests/mine` (Feature 4)
- Validation des pièces jointes obligatoires

**Frontend** :
- `new-request` : sélection catégories → questions dynamiques (A/B/C/D) → upload fichiers
- `requests-list` : tableau filtrable (status, date)
- `request-detail` : vue lecture seule

**Features couvertes** : 3, 4

### Sprint 5 — Évaluation & décisions (M7)
**Backend** :
- Endpoints `/evaluation/inbox` (filtré par assignation)
- PATCH `/answers/{id}` pour modifier `final_value` + audit log
- POST `/decisions` (initial/admin/field) avec garde de transition
- Verrouillage (`is_locked`) après PENDING_ADMIN
- `RequestAssignmentService` (Feature 19) avec mode auto/manuel
- Workflow state machine

**Frontend** :
- Composant `inbox` : tableau + filtres + assignment manuel
- Composant `review` : vue détaillée + ajustement notes A/B/C/D + champ note évaluateur + boutons décision (accept/reject/info)
- Section admin "assignments"

**Features couvertes** : 7, 8, 9, 10, 11, 12, 19

### Sprint 6 — Scoring, rapports & export (M7)
**Backend** :
- `ScoringService` (calcul automatique au passage APPROVED_FINAL)
- `PdfReportService` (iText 7 avec font Amiri pour RTL)
- `ExcelExportService` (Apache POI)
- Endpoint `/reports/{requestId}/pdf` (génération + stockage)
- Endpoint `/admin/reports/dashboard` (KPI agrégés)
- Endpoint `/admin/reports/export?type=pdf|excel`
- Notification finale envoyée à l'institution

**Frontend** :
- Composant `request-detail` : affichage résultats final + bouton téléchargement PDF
- Composant `reports` : dashboard avec ng2-charts (pie, bar, line)
- Boutons d'export PDF/Excel

**Features couvertes** : 6, 13, 14, 21, 22

### Sprint 7 — Audit, notifications, finition (M7)
**Backend** :
- `@Audit` AOP appliqué sur tous les services sensibles
- Endpoint `/admin/audit-log` avec filtres
- WebSocket STOMP + canal `/topic/notifications/{userId}`
- `NotificationService` event-driven (`@EventListener`)
- Templates email Thymeleaf (ar + en)

**Frontend** :
- Cloche notifications dans toolbar (badge non-lus)
- Centre des notifications (liste + filtre lu/non lu)
- Section admin "audit" (table avec filtres date, user, action)

**Features couvertes** : 5 (notifications complet), 20

---

## Phase 4 — Tests & Pilote (M8–M9)

**Objectif** : qualité, robustesse, retours utilisateurs.

### Tests automatisés
- **Backend** :
  - Tests unitaires (JUnit 5 + Mockito) : services, validators, scoring formula
  - Tests d'intégration (Spring Boot Test + Testcontainers MySQL) : controllers + repositories
  - Tests sécurité : `@WithMockJwtAuth` pour chaque rôle
  - Couverture cible ≥ 60 %
- **Frontend** :
  - Tests Jasmine pour services et guards
  - Tests E2E Cypress sur 3 parcours critiques :
    1. Inscription Jiha → approbation → login → soumission demande
    2. Évaluateur : revue → décision préliminaire → admin approbation
    3. Field reviewer → approbation finale → téléchargement PDF

### Pilote
- Déploiement sur serveur de staging
- Recrutement de 2 institutions pilotes
- Sessions de test utilisateur encadrées (50 min)
- Formulaire de feedback structuré (UEQ ou SUS)

### Corrections & ajustements
- Sprint de bugfix sur retours pilote
- Optimisations performances (queries, indexes manquants)
- Audit accessibilité (WCAG 2.1 AA)

---

## Phase 5 — Déploiement (M10)

### Infrastructure
- Provisioning serveur (VPS Tunisie ou cloud)
- Installation Docker + Docker Compose
- Reverse proxy Nginx avec Let's Encrypt
- Backup automatisé MySQL (mysqldump quotidien chiffré)
- Monitoring : Prometheus + Grafana (optionnel) ou Spring Boot Actuator + Loki

### CI/CD
- GitHub Actions ou GitLab CI :
  - `build-test-backend.yml` : maven build + tests + sonar
  - `build-test-frontend.yml` : npm install + lint + test + build prod
  - `deploy-staging.yml` : push image Docker + redéploiement
  - `deploy-prod.yml` : déploiement manuel après validation

### Documentation finale
- Manuel utilisateur (par rôle, ar + fr)
- Manuel d'administration
- Documentation API (Swagger UI auto-générée)
- Guide de configuration Keycloak

---

## Phase 6 — Maintenance & Évolution (M11–M15)

### Évolutions prévues
- Module statistiques avancées (cohortes, trends)
- Export Word des rapports (en plus de PDF)
- Mobile-first responsive complet
- Mode hors-ligne (PWA)
- Federation LDAP/AD pour grandes institutions
- Multi-tenant (plusieurs organismes évaluateurs)

### KPI de soutenance
- ≥ 22/22 features livrées
- ≥ 60 % couverture tests backend
- Demo live de bout en bout (inscription → rapport final)
- Documentation complète
- Slides + démo (15-20 min)

---

## Mapping rapide : Cahier des charges → Sprint

| # | Feature | Sprint | Module |
|---|---------|--------|--------|
| 1 | Inscription Jiha | S2 | entities |
| 2 | Login | S1 | auth (Keycloak) |
| 3 | Soumettre demande | S4 | requests |
| 4 | Suivi statut | S4 | requests |
| 5 | Notifications | S2 + S7 | notifications |
| 6 | Voir résultats finaux | S6 | reports |
| 7 | Inbox équipe | S5 | evaluation |
| 8 | Réponses + pièces jointes | S4 + S5 | evaluation |
| 9 | Modifier notes | S5 | evaluation |
| 10 | Décision préliminaire | S5 | workflow |
| 11 | Approbation admin | S5 | workflow |
| 12 | Approbation terrain | S5 | workflow |
| 13 | Calcul score final | S6 | scoring |
| 14 | Envoi résultat | S6 | reports + notifications |
| 15 | Gestion users | S2 | users (Keycloak Admin) |
| 16 | Catégories | S3 | catalog |
| 17 | Questions | S3 | catalog |
| 18 | Valeurs A/B/C/D | S3 | catalog |
| 19 | Distribution demandes | S5 | assignment |
| 20 | Audit log | S7 | audit |
| 21 | Dashboard analytics | S6 | reports |
| 22 | Export PDF/Excel | S6 | reports |
