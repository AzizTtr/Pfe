ALTER TABLE users
    ADD COLUMN avatar_url MEDIUMTEXT NULL,
    ADD COLUMN avatar_color VARCHAR(20) NOT NULL DEFAULT '#0f766e',
    ADD COLUMN job_title VARCHAR(120) NULL,
    ADD COLUMN organization VARCHAR(160) NULL,
    ADD COLUMN bio VARCHAR(500) NULL,
    ADD COLUMN timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Tunis',
    ADD COLUMN dashboard_density ENUM('comfortable','compact') NOT NULL DEFAULT 'comfortable',
    ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users
SET job_title = 'Platform administrator',
    organization = 'Arabic Quality Platform',
    bio = 'Manages platform configuration, catalogs, reports, and user access.',
    avatar_color = '#1d4ed8'
WHERE email = 'admin@arabic-quality.local';

UPDATE users
SET job_title = 'Evaluation specialist',
    organization = 'Arabic Quality Platform',
    bio = 'Reviews evaluation submissions and supports quality decisions.',
    avatar_color = '#047857'
WHERE email = 'evaluator@arabic-quality.local';

UPDATE users
SET job_title = 'Institution manager',
    organization = 'Demo institution',
    bio = 'Submits evaluation requests and follows certification progress.',
    avatar_color = '#7c3aed'
WHERE role_id IN (SELECT id FROM roles WHERE code = 'ROLE_ENTITY_MANAGER')
  AND (job_title IS NULL OR job_title = '');
