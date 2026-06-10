-- Sprint 7 demo activity: notifications, audit rows, profiles, and report metadata.

UPDATE users
SET avatar_color = CASE
        WHEN role_id = (SELECT id FROM roles WHERE code = 'ROLE_PLATFORM_ADMIN') THEN '#1d4ed8'
        WHEN role_id = (SELECT id FROM roles WHERE code = 'ROLE_EVALUATOR') THEN '#047857'
        WHEN role_id = (SELECT id FROM roles WHERE code = 'ROLE_ADMIN_REVIEWER') THEN '#be123c'
        WHEN role_id = (SELECT id FROM roles WHERE code = 'ROLE_FIELD_REVIEWER') THEN '#c2410c'
        ELSE '#0f766e'
    END,
    timezone = COALESCE(NULLIF(timezone, ''), 'Africa/Tunis'),
    dashboard_density = COALESCE(dashboard_density, 'comfortable'),
    email_notifications = TRUE
WHERE email LIKE '%@demo.local'
   OR email LIKE '%@arabic-quality.local';

UPDATE users
SET job_title = 'Platform administrator',
    organization = 'Arabic Quality Platform',
    bio = 'Reviews audit activity, user access, catalog resources, reports, and platform health.'
WHERE email = 'admin@arabic-quality.local'
  AND (job_title IS NULL OR job_title = '');

UPDATE users
SET job_title = 'Senior evaluation specialist',
    organization = 'Arabic Quality Platform',
    bio = 'Reviews submitted evidence, updates final ratings, and prepares workflow recommendations.'
WHERE email IN ('evaluator@arabic-quality.local', 'evaluator.demo@demo.local', 'evaluator.sara@demo.local', 'evaluator.omar@demo.local')
  AND (job_title IS NULL OR job_title = '');

INSERT INTO notifications
    (user_id, event_type, title_ar, title_en, message_ar, message_en, related_entity, related_id, link_url, is_read, sent_via_email, created_at)
SELECT u.id,
       seed.event_type,
       seed.title_ar,
       seed.title_en,
       seed.message_ar,
       seed.message_en,
       seed.related_entity,
       seed.related_id,
       seed.link_url,
       seed.is_read,
       seed.sent_via_email,
       DATE_SUB(NOW(), INTERVAL seed.hours_ago HOUR)
FROM users u
JOIN (
    SELECT 'admin@arabic-quality.local' AS email, 'AUDIT_REVIEW' AS event_type,
           'نشاط تدقيق جديد' AS title_ar, 'New audit activity' AS title_en,
           'تم تسجيل عدة عمليات حساسة في سجل التدقيق.' AS message_ar,
           'Several sensitive operations were recorded in the audit log.' AS message_en,
           'audit_log' AS related_entity, NULL AS related_id, '/admin/audit' AS link_url,
           FALSE AS is_read, FALSE AS sent_via_email, 2 AS hours_ago
    UNION ALL SELECT 'admin@arabic-quality.local', 'PENDING_REGISTRATIONS',
           'طلبات تسجيل بانتظار المراجعة', 'Pending registrations need review',
           'توجد طلبات تسجيل جديدة تحتاج إلى قرار إداري.',
           'New registration requests are waiting for an administrative decision.',
           'registration_request', NULL, '/admin/registrations', FALSE, FALSE, 4
    UNION ALL SELECT 'manager.cairo@demo.local', 'REQUEST_STATUS_CHANGED',
           'تم تحديث حالة الطلب', 'Request status updated',
           'انتقل طلب التقييم إلى مرحلة المراجعة.',
           'Your evaluation request moved to the review stage.',
           'evaluation_request', NULL, '/my-requests', FALSE, TRUE, 6
    UNION ALL SELECT 'manager.doha@demo.local', 'REPORT_READY',
           'التقرير النهائي جاهز', 'Final report is ready',
           'يمكنك تحميل التقرير الرسمي من صفحة الطلب.',
           'You can download the official report from the request detail page.',
           'evaluation_request', NULL, '/my-requests', FALSE, TRUE, 8
    UNION ALL SELECT 'manager.dubai@demo.local', 'INFO_REQUESTED',
           'مطلوب معلومات إضافية', 'Additional information requested',
           'يرجى تحديث الأدلة المطلوبة قبل متابعة التقييم.',
           'Please update the requested evidence before the evaluation can continue.',
           'evaluation_request', NULL, '/my-requests', FALSE, TRUE, 10
    UNION ALL SELECT 'evaluator.sara@demo.local', 'ASSIGNMENT_CREATED',
           'تم إسناد طلب جديد', 'New request assigned',
           'تم إسناد طلب تقييم جديد إلى صندوق المراجعة الخاص بك.',
           'A new evaluation request was assigned to your review inbox.',
           'evaluation_request', NULL, '/evaluation', FALSE, FALSE, 5
    UNION ALL SELECT 'admin.mona@demo.local', 'ADMIN_REVIEW_PENDING',
           'مراجعة إدارية مطلوبة', 'Administrative review pending',
           'يوجد طلب جاهز للمراجعة الإدارية.',
           'A request is ready for administrative review.',
           'evaluation_request', NULL, '/evaluation', TRUE, FALSE, 24
) seed ON seed.email = u.email
WHERE NOT EXISTS (
    SELECT 1
    FROM notifications n
    WHERE n.user_id = u.id
      AND n.event_type = seed.event_type
      AND n.title_en = seed.title_en
);

INSERT INTO audit_log
    (user_id, user_email, action_type, entity_type, entity_id, description, before_value, after_value, ip_address, user_agent, success, created_at)
SELECT u.id,
       u.email,
       seed.action_type,
       seed.entity_type,
       seed.entity_id,
       seed.description,
       seed.before_value,
       seed.after_value,
       seed.ip_address,
       'Codex Sprint 7 demo activity',
       seed.success,
       DATE_SUB(NOW(), INTERVAL seed.hours_ago HOUR)
FROM users u
JOIN (
    SELECT 'admin@arabic-quality.local' AS email, 'VIEW_AUDIT_LOG' AS action_type, 'audit_log' AS entity_type,
           NULL AS entity_id, 'Platform admin reviewed audit log filters.' AS description,
           JSON_OBJECT('filter', 'none') AS before_value, JSON_OBJECT('result', 'loaded') AS after_value,
           '10.10.0.11' AS ip_address, TRUE AS success, 1 AS hours_ago
    UNION ALL SELECT 'admin@arabic-quality.local', 'EXPORT_REPORTS', 'reports',
           NULL, 'Advanced reports PDF export generated.',
           JSON_OBJECT('format', 'pdf'), JSON_OBJECT('status', 'generated'),
           '10.10.0.11', TRUE, 3
    UNION ALL SELECT 'admin@arabic-quality.local', 'UPDATE_CATALOG', 'evaluation_category',
           NULL, 'Catalog resources reviewed after Sprint 7 demo seed.',
           JSON_OBJECT('active', TRUE), JSON_OBJECT('active', TRUE),
           '10.10.0.11', TRUE, 5
    UNION ALL SELECT 'evaluator.sara@demo.local', 'UPDATE_FINAL_ANSWER', 'evaluation_answer',
           NULL, 'Evaluator adjusted final rating for a demo request.',
           JSON_OBJECT('value', 'C'), JSON_OBJECT('value', 'B'),
           '10.10.0.21', TRUE, 7
    UNION ALL SELECT 'evaluator.omar@demo.local', 'WORKFLOW_DECISION', 'evaluation_request',
           NULL, 'Evaluator requested additional information from institution.',
           JSON_OBJECT('status', 'UNDER_EVALUATION'), JSON_OBJECT('status', 'INFO_REQUESTED'),
           '10.10.0.22', TRUE, 9
    UNION ALL SELECT 'admin.mona@demo.local', 'ASSIGN_REQUEST', 'request_assignment',
           NULL, 'Admin manually assigned a request to a reviewer.',
           JSON_OBJECT('assignedUser', NULL), JSON_OBJECT('assignedUser', 'evaluator.sara@demo.local'),
           '10.10.0.31', TRUE, 11
    UNION ALL SELECT 'field.khaled@demo.local', 'WORKFLOW_DECISION', 'evaluation_request',
           NULL, 'Field reviewer approved final stage for completed demo request.',
           JSON_OBJECT('status', 'PENDING_FIELD'), JSON_OBJECT('status', 'COMPLETED'),
           '10.10.0.41', TRUE, 13
    UNION ALL SELECT 'manager.dubai@demo.local', 'PROFILE_UPDATE_FAILED', 'user_profile',
           NULL, 'Demo failed profile update attempt for audit error state.',
           JSON_OBJECT('avatarSize', 'too_large'), JSON_OBJECT('error', 'validation_failed'),
           '10.10.0.51', FALSE, 15
) seed ON seed.email = u.email
WHERE NOT EXISTS (
    SELECT 1
    FROM audit_log a
    WHERE a.user_email = seed.email
      AND a.action_type = seed.action_type
      AND a.description = seed.description
);

INSERT INTO final_reports
    (request_id, file_uuid, storage_path, language, generated_at, generated_by_user_id, sha256)
SELECT er.id,
       UUID(),
       CONCAT('./reports/demo/sprint7/', er.request_number, '-official.pdf'),
       CASE WHEN er.submitted_by_user_id % 2 = 0 THEN 'en' ELSE 'ar' END,
       DATE_SUB(NOW(), INTERVAL 2 DAY),
       admin_user.id,
       SHA2(CONCAT('sprint7:', er.request_number), 256)
FROM evaluation_requests er
JOIN users admin_user ON admin_user.email = 'admin@arabic-quality.local'
WHERE er.status = 'COMPLETED'
  AND NOT EXISTS (
      SELECT 1
      FROM final_reports fr
      WHERE fr.request_id = er.id
  );
