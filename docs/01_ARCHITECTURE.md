# Architecture du Système — Plateforme d'Évaluation de la Qualité de l'Enseignement de l'Arabe pour Non-Arabophones

> **Projet de Fin d'Études** — Badr Zayani
> **Stack** : Spring Boot 3.x (Java 17+) · Angular 17+ · MySQL 8 · **Keycloak 24+ (OAuth2/OIDC)** · Maven · npm

---

## 1. Vue d'ensemble

L'application est une plateforme web 3-tiers destinée à automatiser le cycle complet d'évaluation de la qualité des services d'enseignement de l'arabe : depuis l'inscription d'une institution éducative jusqu'à l'émission d'un rapport officiel signé, en passant par les revues de l'équipe d'évaluation, l'approbation administrative et l'approbation terrain.

### 1.1 Objectifs techniques

- **Sécurité** : authentification JWT, RBAC fin (5 rôles), audit log complet
- **Multilingue** : interface Arabe (RTL) / Anglais (LTR)
- **Scalabilité** : structure modulaire permettant d'ajouter catégories/questions sans toucher au code
- **Traçabilité** : chaque action est journalisée (qui, quand, quoi, avant/après)
- **Export** : rapports PDF officiels et exports Excel

---

## 2. Architecture en couches

```
┌───────────────────────────────────────────────────────────────┐
│                  CLIENT (Navigateur)                          │
│  Angular 17 SPA · keycloak-angular · RxJS                     │
│  Angular Material · TailwindCSS · ngx-translate · RTL/LTR    │
└──────────┬────────────────────────────────────┬───────────────┘
           │ 1) Login OIDC (PKCE)               │ 2) API + Bearer JWT
           ▼                                    │
┌──────────────────────────┐                    │
│       KEYCLOAK 24+       │                    │
│  Realm : arabic-quality  │ ◄──── 4) JWKS ─────│
│  ─ Users / Groups        │                    │
│  ─ Client : frontend     │                    │
│  ─ Client : backend-api  │                    │
│  ─ Realm Roles (5)       │                    │
│  ─ Password policy       │                    │
│  ─ MFA (TOTP)            │                    │
│  ─ Refresh tokens        │                    │
│  ─ Password reset email  │                    │
└──────────┬───────────────┘                    │
           │ 3) Issues access_token (JWT signé) │
           └────────────────────────────────────▼
┌───────────────────────────────────────────────────────────────┐
│              BACKEND RESOURCE SERVER (Spring Boot)            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  spring-boot-starter-oauth2-resource-server             │  │
│  │  ─ Valide signature JWT via JWKS Keycloak               │  │
│  │  ─ Mappe claims "realm_access.roles" → GrantedAuthority │  │
│  │  ─ KeycloakUserSyncService : crée/update users locaux   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  Controllers (REST)  ──►  DTOs / Validators             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  Services (workflow, scoring, business logic)           │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  Repositories (Spring Data JPA / Hibernate)             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  Cross-cutting:                                         │  │
│  │   • AOP Audit Interceptor                               │  │
│  │   • i18n MessageSource                                  │  │
│  │   • Notification Service (Mail + WebSocket)             │  │
│  │   • Report Generator (iText 7 / Apache POI)             │  │
│  │   • File Storage Service                                │  │
│  │   • Keycloak Admin Client (provisioning users)          │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────────┘
                           │ JDBC
┌──────────────────────────▼────────────────────────────────────┐
│                       MySQL 8.x                               │
│   Schéma métier (sans mots de passe) + audit_log              │
│   users.kc_id (UUID Keycloak) lie chaque profil à un compte   │
└───────────────────────────────────────────────────────────────┘
```

### 2.1 Flux d'authentification OIDC (Authorization Code + PKCE)

```
1. User clique "Se connecter" sur Angular
   └─► redirection vers Keycloak (/realms/arabic-quality/protocol/openid-connect/auth)
2. User saisit credentials sur la page Keycloak (UI customisable)
3. Keycloak renvoie code → Angular l'échange contre access_token + refresh_token
4. Angular stocke tokens (en mémoire ou sessionStorage), ajoute `Authorization: Bearer <jwt>`
   sur chaque requête vers Spring Boot
5. Spring Boot vérifie la signature du JWT auprès du JWKS Keycloak (cache TTL 1h)
   └─► extrait `sub` (UUID), `email`, `realm_access.roles[]`, `preferred_username`
6. KeycloakJwtAuthenticationConverter mappe les rôles → SimpleGrantedAuthority
7. UserSyncFilter (premier accès) : si users.kc_id n'existe pas → INSERT users avec UUID
```

---

## 3. Modules fonctionnels

Le backend est découpé en **packages** (suivant Domain-Driven Design léger) :

| Package | Responsabilité | Fonctionnalités du cahier (n°) |
|---------|----------------|--------------------------------|
| `auth` | Authentification, JWT, refresh token | 2 |
| `users` | CRUD utilisateurs, rôles, permissions | 15 |
| `entities` | Inscription et gestion des Jihat (institutions) | 1 |
| `catalog` | Catégories d'évaluation, Questions, Valeurs (A/B/C/D) | 16, 17, 18 |
| `requests` | Cycle de vie des demandes d'évaluation | 3, 4, 7 |
| `evaluation` | Réponses, pièces jointes, modification des notes | 8, 9 |
| `workflow` | Décisions préliminaire / administrative / terrain | 10, 11, 12 |
| `scoring` | Calcul automatique du score final + classement | 13 |
| `notifications` | Email + In-app (cloche) | 5, 14 |
| `reports` | Génération PDF/Excel, dashboard analytique | 6, 14, 21, 22 |
| `audit` | Audit log immuable | 9, 19, 20 |
| `assignment` | Distribution des demandes au team | 19 |

---

## 4. Modèle d'autorisation (RBAC)

### 4.1 Rôles

| Code | Rôle | Description |
|------|------|-------------|
| `ROLE_ENTITY_MANAGER` | مدير الجهة التعليمية | Représentant d'une institution éducative |
| `ROLE_EVALUATOR` | عضو فريق التقييم | Membre de l'équipe d'évaluation |
| `ROLE_ADMIN_REVIEWER` | المسؤول الإداري | Approbation administrative |
| `ROLE_FIELD_REVIEWER` | المسؤول الميداني | Approbation terrain |
| `ROLE_PLATFORM_ADMIN` | مشرف المنصة | Super admin (Admin Panel complet) |

### 4.2 Matrice des permissions (extrait)

| Action | Entity | Evaluator | Admin Rev. | Field Rev. | Platform Admin |
|--------|:------:|:---------:|:----------:|:----------:|:--------------:|
| Inscrire une Jiha | ✓ | | | | ✓ |
| Soumettre demande d'évaluation | ✓ | | | | |
| Voir ses propres demandes | ✓ | | | | ✓ |
| Voir toutes les demandes assignées | | ✓ | ✓ | ✓ | ✓ |
| Modifier notes initiales | | ✓ | | | ✓ |
| Approbation administrative | | | ✓ | | ✓ |
| Approbation terrain | | | | ✓ | ✓ |
| Gérer catégories/questions | | | | | ✓ |
| Gérer utilisateurs | | | | | ✓ |
| Voir audit log | | | | | ✓ |
| Exporter rapports | | ✓ | ✓ | ✓ | ✓ |

L'implémentation utilise `@PreAuthorize("hasRole('...')")` sur les méthodes des services + filtrage au niveau repository (queries scoped à l'utilisateur).

---

## 5. Cycle de vie d'une demande d'évaluation

```
[NEW] ─────► [PENDING_REVIEW] ─────► [UNDER_EVALUATION]
                                         │
                                         ├─► [INFO_REQUESTED] ──► back to entity
                                         ├─► [REJECTED_INITIAL]
                                         └─► [APPROVED_INITIAL]
                                                │
                                                ▼
                                         [PENDING_ADMIN]
                                            │
                                            ├─► [REJECTED_ADMIN]
                                            └─► [APPROVED_ADMIN]
                                                │
                                                ▼
                                         [PENDING_FIELD]
                                            │
                                            ├─► [REJECTED_FINAL]
                                            └─► [APPROVED_FINAL] ──► [COMPLETED]
                                                                       │
                                                                       ▼
                                                              [REPORT_GENERATED]
```

Chaque transition d'état :
- est protégée par une garde (état actuel + rôle requis)
- déclenche une notification automatique à l'entité concernée
- est loguée dans `audit_log`
- est verrouillée après confirmation (impossible de modifier les notes après `PENDING_ADMIN`)

---

## 6. Calcul du score final (Feature 13)

### 6.1 Formule

```
Pour chaque catégorie c choisie dans la demande :
    score(c) = Σ (poids_de_la_valeur_choisie pour question q) pour q ∈ catégorie c
    max(c) = nb_questions(c) × poids_max  (généralement A = 4)
    pourcentage(c) = score(c) / max(c) × 100

score_total_pourcentage = Σ score(c) / Σ max(c) × 100
```

### 6.2 Échelle de classement (configurable en BDD, table `grading_scale`)

| Min % | Max % | Classification |
|-------|-------|---------------|
| 90 | 100 | ممتاز (Excellent) |
| 75 | 89.99 | جيد جدًا (Très bien) |
| 60 | 74.99 | جيد (Bien) |
| 40 | 59.99 | مقبول (Acceptable) |
| 0 | 39.99 | ضعيف (Insuffisant) |

Le calcul est lancé **automatiquement** lorsque le statut passe à `APPROVED_FINAL`, et figé en BDD (champ `final_score`, `final_grade` immuables après ça).

---

## 7. Sécurité — Délégation à Keycloak

### 7.1 Authentification (OIDC via Keycloak)

L'application **ne gère plus** elle-même : login form, hashage de mots de passe, refresh tokens, reset password, sessions. Tout est délégué à Keycloak.

| Aspect | Délégué à Keycloak | Géré par Spring Boot |
|--------|:------------------:|:--------------------:|
| Login / Logout | ✓ | |
| Hashage mot de passe (PBKDF2 par défaut) | ✓ | |
| Politique de mot de passe | ✓ | |
| Reset password par email | ✓ | |
| Refresh tokens | ✓ | |
| MFA (TOTP, WebAuthn) | ✓ | |
| Federation LDAP/AD/Google | ✓ | |
| Validation JWT signature | | ✓ (via JWKS) |
| Autorisations métier (RBAC) | rôles | enforcement |
| Audit business | | ✓ |

### 7.2 Configuration Keycloak

- **Realm** : `arabic-quality`
- **Clients** :
  - `frontend-spa` : type `public`, flow `Standard` (Authorization Code + PKCE), valid redirect URIs `http://localhost:4200/*`
  - `backend-api` : type `bearer-only` (n'émet pas de tokens, valide uniquement)
- **Realm Roles** (mappées 1-1 sur les rôles applicatifs) :
  - `ROLE_ENTITY_MANAGER`, `ROLE_EVALUATOR`, `ROLE_ADMIN_REVIEWER`, `ROLE_FIELD_REVIEWER`, `ROLE_PLATFORM_ADMIN`
- **Token TTL** :
  - Access token : 15 min (configurable)
  - Refresh token : 30 min (rolling)
  - SSO session : 8 h
- **Politique mot de passe** (configurée dans Keycloak Admin) :
  - Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
  - Pas de réutilisation des 3 derniers
  - Expiration optionnelle 90 jours

### 7.3 Synchronisation utilisateurs Keycloak ↔ MySQL

Stratégie **lazy sync** :
1. Au premier accès d'un user authentifié, le filter `KeycloakUserSyncFilter` regarde si `users.kc_id = <sub du JWT>` existe.
2. Si non → INSERT dans `users` avec données du JWT (email, full_name, role).
3. Si oui mais email/nom diffèrent → UPDATE.

**Provisioning à l'inscription d'une Jiha** : quand un Platform Admin approuve une `registration_request`, le backend appelle l'API Admin de Keycloak via `keycloak-admin-client` :
```
POST {keycloak}/admin/realms/arabic-quality/users
{
  "username": "manager@jiha.example",
  "email": "...",
  "firstName": "...",
  "lastName": "...",
  "enabled": true,
  "credentials": [{ "type": "password", "value": "<temp>", "temporary": true }],
  "realmRoles": ["ROLE_ENTITY_MANAGER"]
}
```
Keycloak envoie automatiquement l'email "Set up your password" → l'utilisateur définit son mot de passe lui-même (jamais transitté par notre backend).

### 7.3 Protection contre les attaques

| Attaque | Contre-mesure |
|---------|---------------|
| SQL Injection | JPA + paramètres bindés (jamais de string concat) |
| XSS | Angular escape par défaut + Content-Security-Policy header |
| CSRF | Stateless JWT (pas de session cookie) |
| Brute force login | Rate limiting (5 tentatives / 15 min par IP+email) |
| Upload malveillant | Whitelist MIME (PDF, JPG, PNG, DOCX) + scan taille (max 10 Mo) |

---

## 8. Internationalisation (i18n)

### 8.1 Langues supportées

- **Arabe** (`ar`) — défaut, RTL
- **Anglais** (`en`) — LTR

### 8.2 Backend

- `MessageSource` Spring : fichiers `messages_ar.properties`, `messages_en.properties`
- Header HTTP `Accept-Language` lu via `LocaleResolver`
- Toutes les exceptions retournent un code message + un message localisé

### 8.3 Frontend

- `@ngx-translate/core` : fichiers JSON `assets/i18n/ar.json` et `assets/i18n/en.json`
- Direction RTL/LTR togglée dynamiquement sur `<html dir="...">`
- Tailwind avec `tailwindcss-rtl` plugin

### 8.4 Données (catégories, questions, valeurs)

Champs `name_ar`, `name_en`, `description_ar`, `description_en` directement dans les tables — pas de table de traduction séparée (simplicité PFE).

---

## 9. Notifications (Feature 5)

### 9.1 Canaux

- **Email** : Spring Mail avec template Thymeleaf, SMTP configurable
- **In-app** : table `notifications` + WebSocket (STOMP) pour push temps réel

### 9.2 Événements déclencheurs

| Événement | Destinataire(s) |
|-----------|-----------------|
| Inscription Jiha soumise | Platform Admin |
| Inscription approuvée/rejetée | Manager de la Jiha |
| Demande d'évaluation soumise | Évaluateurs assignés |
| Décision préliminaire émise | Manager de la Jiha |
| Info supplémentaire demandée | Manager de la Jiha |
| Demande passée à approbation admin | Admin Reviewers |
| Approbation administrative | Field Reviewers + Manager |
| Approbation finale | Manager (avec rapport PDF) |

Implementation pattern : **Event Publisher Spring** (`ApplicationEventPublisher`) → listeners async (`@EventListener` + `@Async`).

---

## 10. Stockage des fichiers

### 10.1 Stratégie

- **Phase PFE** : stockage local dans `./uploads/` avec sous-dossiers par année/mois/demande
- **Production future** : remplaçable par S3/MinIO via interface `FileStorageService`

### 10.2 Métadonnées en BDD

Chaque fichier uploadé est référencé dans `attachments` avec :
- UUID (nom physique aléatoire pour éviter collisions)
- Nom original
- MIME type, taille
- Lien vers la demande/question concernée
- Hash SHA-256 (intégrité)

---

## 11. Génération de rapports

### 11.1 Rapport PDF officiel

- Bibliothèque : **iText 7** (gestion native arabe RTL via fonts Amiri/Cairo)
- Template défini dans `report-template.xml` (markup interne)
- Contenu : logo, infos Jiha, tableau catégorie/question/réponse/score, score global, classification, signature
- Bilingue (ar/en) selon préférence utilisateur

### 11.2 Exports Excel

- Bibliothèque : **Apache POI**
- Sheets multiples : Synthèse, Détails par catégorie, Logs

---

## 12. Audit Log (Feature 20)

### 12.1 Schéma

Table `audit_log` :
- `id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `before_value` (JSON), `after_value` (JSON), `ip_address`, `created_at`

### 12.2 Implémentation

- Aspect AOP `@LogActivity` annotation sur méthodes de service
- Hibernate `@EntityListeners` pour CREATE/UPDATE/DELETE automatiques
- Lecture seule via `/api/admin/audit-log` (Platform Admin uniquement)
- **Aucun endpoint de suppression** (immuabilité garantie côté code)

---

## 13. Dashboard analytique (Feature 21)

### 13.1 KPIs principaux

- Demandes par statut (Pie chart)
- Demandes par mois (Line chart)
- Score moyen par catégorie (Bar chart)
- Top/Bottom 10 institutions (Table)
- Distribution géographique (si données pays/ville disponibles)

### 13.2 Bibliothèques frontend

- **ng2-charts + Chart.js** : graphiques interactifs
- Drilldown : clic sur élément → ouvre table détaillée

---

## 14. Stack technique détaillée

### 14.1 Backend (Spring Boot 3.2.x, Java 17)

| Dépendance | Version | Rôle |
|------------|---------|------|
| spring-boot-starter-web | 3.2.x | REST controllers |
| spring-boot-starter-data-jpa | 3.2.x | ORM |
| spring-boot-starter-security | 3.2.x | Sécurité |
| spring-boot-starter-oauth2-resource-server | 3.2.x | Validation JWT Keycloak |
| keycloak-admin-client | 24.x | Provisioning users via API admin |
| spring-boot-starter-validation | 3.2.x | Validation Bean |
| spring-boot-starter-mail | 3.2.x | Email (notifications business) |
| spring-boot-starter-websocket | 3.2.x | Notifications temps réel |
| spring-boot-starter-aop | 3.2.x | Audit AOP |
| mysql-connector-j | 8.x | Driver MySQL |
| flyway-core + flyway-mysql | 10.x | Migrations BDD |
| lombok | dernière | Réduction boilerplate |
| mapstruct | 1.5.x | Mapping Entity/DTO |
| itext7-core | 8.x | PDF |
| apache-poi-ooxml | 5.x | Excel |
| springdoc-openapi-starter-webmvc-ui | 2.x | Swagger UI |

### 14.2 Frontend (Angular 17, TypeScript 5)

| Dépendance | Version | Rôle |
|------------|---------|------|
| @angular/core, common, router, forms | 17.x | Core Angular |
| @angular/material + cdk | 17.x | UI components |
| keycloak-angular + keycloak-js | 16.x / 24.x | Intégration OIDC Keycloak |
| tailwindcss + tailwindcss-rtl | 3.4.x | Styling |
| @ngx-translate/core + http-loader | 15.x | i18n |
| chart.js + ng2-charts | 4.x | Graphiques |
| rxjs | 7.x | Reactive |
| jwt-decode | 4.x | Décodage JWT côté client |
| ngx-toastr | 18.x | Toasts notifications |
| ngx-file-drop | 16.x | Drag & drop upload |
| @stomp/stompjs + sockjs-client | 7.x / 1.x | WebSocket |

---

## 15. Environnements & déploiement

| Env | Backend | Frontend | DB | Notes |
|-----|---------|----------|----|----|
| Dev local | localhost:8080 | localhost:4200 | localhost:3306 | Hot reload |
| Staging | API derrière Nginx | Build prod servi par Nginx | RDS / serveur dédié | Pré-prod |
| Prod | Spring Boot + Docker | Build statique + CDN | MySQL géré | Logs centralisés |

Profils Spring : `dev`, `staging`, `prod` avec fichiers `application-{profile}.yml`.

---

## 16. Diagramme de déploiement (texte)

```
                              ┌─────────────┐
                              │   Nginx     │  (reverse proxy + TLS)
                              └──┬───┬───┬──┘
              ┌──────────────────┘   │   └──────────────────┐
              ▼                      ▼                      ▼
   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
   │ Angular static  │    │  Keycloak 24    │    │ Spring Boot JAR │
   │ files (dist/)   │    │  port 8180      │    │ port 8080       │
   └─────────────────┘    └────────┬────────┘    └────────┬────────┘
                                   │                      │
                                   ▼                      ▼
                          ┌─────────────────┐    ┌─────────────────┐
                          │ Keycloak DB     │    │ App MySQL 8     │
                          │ (PostgreSQL ou  │    │ port 3306       │
                          │  MySQL séparé)  │    └────────┬────────┘
                          └─────────────────┘             │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ Volume Storage  │
                                                 │ /uploads        │
                                                 └─────────────────┘
```

> **Bonne pratique** : Keycloak utilise sa propre base (idéalement PostgreSQL recommandé par RedHat) — ne pas mélanger avec la base métier.
> En dev, on lance Keycloak via `docker-compose` en mode `start-dev` (H2 embarqué suffit).

---

## 17. Tests (recommandation pour le PFE)

| Niveau | Outils | Cible |
|--------|--------|-------|
| Unitaires backend | JUnit 5 + Mockito | Services, validators, scoring |
| Intégration backend | Spring Boot Test + Testcontainers (MySQL) | Repositories, controllers |
| Unitaires frontend | Jasmine + Karma | Components, services |
| E2E | Cypress ou Playwright | Parcours complet utilisateur |
| Couverture cible | ≥ 60 % backend, ≥ 40 % frontend | Pour soutenance |

---

*Document version 1.0 — basé sur le cahier des charges du projet "مقياس جودة تعليم اللغة العربية لغير الناطقين بها".*
