-- =========================================================================
--  PFE — Plateforme d'évaluation de la qualité de l'enseignement de l'arabe
--  Schéma MySQL 8.x (compatible MariaDB 10.6+)
--  Auteur : Badr Zayani
-- =========================================================================
--  Convention : table_name (snake_case, pluriel), id BIGINT AUTO_INCREMENT
--  Tous les timestamps sont DATETIME avec valeurs par défaut.
--  Soft delete via colonne deleted_at NULL (sauf audit_log immutable).
-- =========================================================================

DROP DATABASE IF EXISTS arabic_quality_db;
CREATE DATABASE arabic_quality_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE arabic_quality_db;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. RÔLES & UTILISATEURS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE roles (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL UNIQUE,    -- ROLE_ENTITY_MANAGER, etc.
    name_ar      VARCHAR(100) NOT NULL,
    name_en      VARCHAR(100) NOT NULL,
    description  VARCHAR(255),
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (code, name_ar, name_en, description) VALUES
 ('ROLE_ENTITY_MANAGER',  'مدير الجهة التعليمية', 'Educational Entity Manager', 'Représentant Jiha'),
 ('ROLE_EVALUATOR',       'عضو فريق التقييم',     'Evaluation Team Member',   'Évaluateur'),
 ('ROLE_ADMIN_REVIEWER',  'المسؤول الإداري',       'Administrative Reviewer',  'Approbation admin'),
 ('ROLE_FIELD_REVIEWER',  'المسؤول الميداني',      'Field Reviewer',           'Approbation terrain'),
 ('ROLE_PLATFORM_ADMIN',  'مشرف المنصة',           'Platform Administrator',   'Super admin');

-- Note : les utilisateurs sont GÉRÉS PAR KEYCLOAK (mots de passe, MFA, refresh tokens,
-- reset password). Cette table stocke uniquement le PROFIL MÉTIER local et la liaison
-- via kc_id (UUID Keycloak = JWT 'sub' claim).
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    kc_id           CHAR(36)     NOT NULL UNIQUE COMMENT 'Keycloak user UUID (sub claim)',
    email           VARCHAR(150) NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(30),
    role_id         BIGINT       NOT NULL,
    preferred_lang  ENUM('ar','en') NOT NULL DEFAULT 'ar',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   DATETIME     NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME     NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_role (role_id),
    INDEX idx_users_active (is_active),
    INDEX idx_users_kc (kc_id)
) ENGINE=InnoDB COMMENT='Profil métier — auth déléguée à Keycloak';

-- Note : refresh_tokens et password_reset_tokens ne sont PAS créés ici
-- car Keycloak gère intégralement le cycle de vie des sessions et des
-- réinitialisations de mot de passe.

-- ─────────────────────────────────────────────────────────────────────────
-- 2. INSTITUTIONS ÉDUCATIVES (الجهات التعليمية)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE registration_requests (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_name           VARCHAR(200) NOT NULL,
    manager_name          VARCHAR(150) NOT NULL,
    country               VARCHAR(100) NOT NULL,
    city                  VARCHAR(100) NOT NULL,
    email                 VARCHAR(150) NOT NULL,
    phone                 VARCHAR(30)  NOT NULL,
    description           TEXT,
    status                ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason      TEXT,
    reviewed_by_user_id   BIGINT NULL,
    reviewed_at           DATETIME NULL,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_regreq_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id),
    INDEX idx_regreq_status (status),
    INDEX idx_regreq_email (email)
) ENGINE=InnoDB;

CREATE TABLE registration_documents (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id     BIGINT       NOT NULL,
    file_uuid           CHAR(36)     NOT NULL UNIQUE,
    original_name       VARCHAR(255) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    size_bytes          BIGINT       NOT NULL,
    storage_path        VARCHAR(500) NOT NULL,
    sha256              CHAR(64)     NOT NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_regdoc_req FOREIGN KEY (registration_id) REFERENCES registration_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE educational_entities (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    description     TEXT,
    manager_user_id BIGINT       NOT NULL UNIQUE,    -- 1 manager par entity
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_entity_manager FOREIGN KEY (manager_user_id) REFERENCES users(id),
    INDEX idx_entity_active (is_active)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. CATALOGUE D'ÉVALUATION (Catégories, Questions, Valeurs)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE evaluation_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50)  NOT NULL UNIQUE,
    name_ar         VARCHAR(150) NOT NULL,
    name_en         VARCHAR(150) NOT NULL,
    description_ar  TEXT,
    description_en  TEXT,
    display_order   INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat_active (is_active)
) ENGINE=InnoDB;

-- Valeurs d'évaluation A/B/C/D (Feature 18)
CREATE TABLE evaluation_values (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(10)  NOT NULL UNIQUE,    -- A, B, C, D
    label_ar        VARCHAR(100) NOT NULL,
    label_en        VARCHAR(100) NOT NULL,
    numeric_score   DECIMAL(5,2) NOT NULL,           -- 4.00, 3.00, 2.00, 1.00
    display_order   INT          NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO evaluation_values (code, label_ar, label_en, numeric_score, display_order) VALUES
 ('A', 'مطابق تمامًا للمعايير', 'Fully compliant',     4.00, 1),
 ('B', 'مطابق إلى حد كبير',     'Largely compliant',   3.00, 2),
 ('C', 'مطابق جزئيًا',          'Partially compliant', 2.00, 3),
 ('D', 'غير مطابق',              'Non compliant',       1.00, 4);

CREATE TABLE questions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id         BIGINT       NOT NULL,
    text_ar             TEXT         NOT NULL,
    text_en             TEXT         NOT NULL,
    requires_attachment BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order       INT          NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_q_category FOREIGN KEY (category_id) REFERENCES evaluation_categories(id),
    INDEX idx_q_category (category_id),
    INDEX idx_q_active (is_active)
) ENGINE=InnoDB;

-- Pièces jointes obligatoires/optionnelles par catégorie
CREATE TABLE category_required_documents (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT       NOT NULL,
    label_ar        VARCHAR(200) NOT NULL,
    label_en        VARCHAR(200) NOT NULL,
    is_mandatory    BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order   INT          NOT NULL DEFAULT 0,
    CONSTRAINT fk_crd_cat FOREIGN KEY (category_id) REFERENCES evaluation_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. ÉCHELLE DE NOTATION (configurable)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE grading_scale (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_percentage  DECIMAL(5,2) NOT NULL,
    max_percentage  DECIMAL(5,2) NOT NULL,
    label_ar        VARCHAR(100) NOT NULL,
    label_en        VARCHAR(100) NOT NULL,
    color_hex       VARCHAR(7)   NOT NULL DEFAULT '#cccccc',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

INSERT INTO grading_scale (min_percentage, max_percentage, label_ar, label_en, color_hex) VALUES
 (90.00, 100.00, 'ممتاز',       'Excellent',  '#16a34a'),
 (75.00,  89.99, 'جيد جدًا',     'Very Good',  '#22c55e'),
 (60.00,  74.99, 'جيد',          'Good',       '#eab308'),
 (40.00,  59.99, 'مقبول',        'Acceptable', '#f97316'),
 ( 0.00,  39.99, 'ضعيف',         'Insufficient','#dc2626');

-- ─────────────────────────────────────────────────────────────────────────
-- 5. DEMANDES D'ÉVALUATION
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE evaluation_requests (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number        VARCHAR(30) NOT NULL UNIQUE,    -- REQ-2026-000001
    entity_id             BIGINT      NOT NULL,
    submitted_by_user_id  BIGINT      NOT NULL,
    status                ENUM(
                            'DRAFT',
                            'PENDING_REVIEW',
                            'UNDER_EVALUATION',
                            'INFO_REQUESTED',
                            'REJECTED_INITIAL',
                            'APPROVED_INITIAL',
                            'PENDING_ADMIN',
                            'REJECTED_ADMIN',
                            'APPROVED_ADMIN',
                            'PENDING_FIELD',
                            'REJECTED_FINAL',
                            'APPROVED_FINAL',
                            'COMPLETED'
                          ) NOT NULL DEFAULT 'DRAFT',
    submitted_at          DATETIME    NULL,
    final_score           DECIMAL(6,2) NULL,
    final_percentage      DECIMAL(5,2) NULL,
    final_grade_id        BIGINT       NULL,
    is_locked             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_er_entity   FOREIGN KEY (entity_id) REFERENCES educational_entities(id),
    CONSTRAINT fk_er_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_er_grade     FOREIGN KEY (final_grade_id) REFERENCES grading_scale(id),
    INDEX idx_er_status (status),
    INDEX idx_er_entity (entity_id),
    INDEX idx_er_submitted (submitted_at)
) ENGINE=InnoDB;

-- Catégories choisies pour chaque demande (M-N)
CREATE TABLE evaluation_request_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id      BIGINT NOT NULL,
    category_id     BIGINT NOT NULL,
    UNIQUE KEY uk_erc_pair (request_id, category_id),
    CONSTRAINT fk_erc_req FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_erc_cat FOREIGN KEY (category_id) REFERENCES evaluation_categories(id)
) ENGINE=InnoDB;

-- Réponses aux questions
CREATE TABLE evaluation_answers (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id                  BIGINT NOT NULL,
    question_id                 BIGINT NOT NULL,
    initial_value_id            BIGINT NULL,             -- la valeur que l'entité s'attribue
    final_value_id              BIGINT NULL,             -- valeur après modif par évaluateur
    answer_text                 TEXT,
    evaluator_note              TEXT,                    -- note de l'évaluateur
    edited_by_evaluator_id      BIGINT NULL,
    edited_at                   DATETIME NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ea_pair (request_id, question_id),
    CONSTRAINT fk_ea_req      FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_question FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_ea_init_val FOREIGN KEY (initial_value_id) REFERENCES evaluation_values(id),
    CONSTRAINT fk_ea_final_val FOREIGN KEY (final_value_id) REFERENCES evaluation_values(id),
    CONSTRAINT fk_ea_editor   FOREIGN KEY (edited_by_evaluator_id) REFERENCES users(id),
    INDEX idx_ea_req (request_id)
) ENGINE=InnoDB;

-- Pièces jointes par réponse / catégorie
CREATE TABLE evaluation_attachments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id          BIGINT       NOT NULL,
    category_id         BIGINT       NULL,
    answer_id           BIGINT       NULL,
    required_doc_id     BIGINT       NULL,
    file_uuid           CHAR(36)     NOT NULL UNIQUE,
    original_name       VARCHAR(255) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    size_bytes          BIGINT       NOT NULL,
    storage_path        VARCHAR(500) NOT NULL,
    sha256              CHAR(64)     NOT NULL,
    uploaded_by_user_id BIGINT       NOT NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eatt_req     FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_eatt_cat     FOREIGN KEY (category_id) REFERENCES evaluation_categories(id),
    CONSTRAINT fk_eatt_answer  FOREIGN KEY (answer_id) REFERENCES evaluation_answers(id),
    CONSTRAINT fk_eatt_reqdoc  FOREIGN KEY (required_doc_id) REFERENCES category_required_documents(id),
    CONSTRAINT fk_eatt_user    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
    INDEX idx_eatt_req (request_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. WORKFLOW : Décisions et étapes
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE request_assignments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id          BIGINT      NOT NULL,
    stage               ENUM('INITIAL_EVALUATION','ADMIN_REVIEW','FIELD_REVIEW') NOT NULL,
    assigned_user_id    BIGINT      NOT NULL,
    assigned_by_user_id BIGINT      NOT NULL,
    is_auto             BOOLEAN     NOT NULL DEFAULT FALSE,
    assigned_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME    NULL,
    UNIQUE KEY uk_ra_stage (request_id, stage),
    CONSTRAINT fk_ra_req      FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_assigned FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    CONSTRAINT fk_ra_assigner FOREIGN KEY (assigned_by_user_id) REFERENCES users(id),
    INDEX idx_ra_user (assigned_user_id)
) ENGINE=InnoDB;

CREATE TABLE workflow_decisions (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id        BIGINT     NOT NULL,
    stage             ENUM('INITIAL_EVALUATION','ADMIN_REVIEW','FIELD_REVIEW') NOT NULL,
    decision          ENUM('APPROVED','REJECTED','REQUEST_INFO') NOT NULL,
    notes             TEXT,
    decided_by_user_id BIGINT    NOT NULL,
    decided_at        DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_wd_stage (request_id, stage),
    CONSTRAINT fk_wd_req  FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_wd_user FOREIGN KEY (decided_by_user_id) REFERENCES users(id),
    INDEX idx_wd_req (request_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 7. RAPPORTS GÉNÉRÉS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE final_reports (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id      BIGINT       NOT NULL UNIQUE,
    file_uuid       CHAR(36)     NOT NULL UNIQUE,
    storage_path    VARCHAR(500) NOT NULL,
    language        ENUM('ar','en') NOT NULL DEFAULT 'ar',
    generated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by_user_id BIGINT  NOT NULL,
    sha256          CHAR(64)     NOT NULL,
    CONSTRAINT fk_fr_req  FOREIGN KEY (request_id) REFERENCES evaluation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_user FOREIGN KEY (generated_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS (Feature 5)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    event_type      VARCHAR(80)  NOT NULL,            -- REQUEST_APPROVED, INFO_REQUESTED…
    title_ar        VARCHAR(200) NOT NULL,
    title_en        VARCHAR(200) NOT NULL,
    message_ar      TEXT         NOT NULL,
    message_en      TEXT         NOT NULL,
    related_entity  VARCHAR(50),                      -- 'evaluation_request', 'registration', …
    related_id      BIGINT,
    link_url        VARCHAR(500),
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_via_email  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at         DATETIME     NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_unread (user_id, is_read),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 9. AUDIT LOG (Feature 20) — IMMUTABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NULL,
    user_email      VARCHAR(150) NULL,
    action_type     VARCHAR(80)  NOT NULL,    -- LOGIN, CREATE, UPDATE, DELETE, EXPORT, etc.
    entity_type     VARCHAR(80)  NULL,        -- 'evaluation_request', 'user', etc.
    entity_id       BIGINT       NULL,
    description     VARCHAR(500),
    before_value    JSON         NULL,
    after_value     JSON         NULL,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    success         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_date (created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────────
-- 10. PARAMÈTRES SYSTÈME
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE system_settings (
    `key`           VARCHAR(100) PRIMARY KEY,
    value           TEXT,
    description     VARCHAR(255),
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by_user_id BIGINT NULL,
    CONSTRAINT fk_settings_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO system_settings (`key`, value, description) VALUES
 ('platform.name.ar',    'مقياس جودة تعليم اللغة العربية', 'Nom de la plateforme (AR)'),
 ('platform.name.en',    'Arabic Teaching Quality Scale',   'Nom de la plateforme (EN)'),
 ('auto_assign.enabled', 'true',                            'Distribution auto activée'),
 ('max_upload_mb',       '10',                              'Taille max upload (Mo)'),
 ('jwt.access_ttl_min',  '15',                              'TTL access token (min)'),
 ('jwt.refresh_ttl_days','7',                               'TTL refresh token (jours)');

-- ─────────────────────────────────────────────────────────────────────────
-- 11. VUES UTILES (analytics dashboard)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_request_summary AS
SELECT
    er.id,
    er.request_number,
    er.status,
    er.final_percentage,
    gs.label_ar  AS grade_ar,
    gs.label_en  AS grade_en,
    ee.name      AS entity_name,
    ee.country,
    ee.city,
    er.submitted_at,
    er.updated_at
FROM evaluation_requests er
JOIN educational_entities ee ON ee.id = er.entity_id
LEFT JOIN grading_scale gs   ON gs.id = er.final_grade_id;

CREATE OR REPLACE VIEW v_category_avg_score AS
SELECT
    c.id            AS category_id,
    c.name_ar,
    c.name_en,
    COUNT(DISTINCT ea.request_id) AS evaluated_requests,
    AVG(ev.numeric_score) AS avg_score
FROM evaluation_categories c
JOIN questions q ON q.category_id = c.id
JOIN evaluation_answers ea ON ea.question_id = q.id
JOIN evaluation_values ev ON ev.id = COALESCE(ea.final_value_id, ea.initial_value_id)
JOIN evaluation_requests er ON er.id = ea.request_id
WHERE er.status = 'COMPLETED'
GROUP BY c.id, c.name_ar, c.name_en;

-- =========================================================================
--  FIN DU SCHÉMA
-- =========================================================================
