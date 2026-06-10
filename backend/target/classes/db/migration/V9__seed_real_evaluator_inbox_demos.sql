-- Real evaluator inbox demos for evaluator@arabic-quality.local.
-- These requests make /evaluation useful with the imported Keycloak evaluator account.

INSERT INTO users
    (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at,
     job_title, organization, bio, avatar_color, timezone, dashboard_density, email_notifications)
SELECT '30000000-0000-0000-0000-000000000101',
       'evaluator@arabic-quality.local',
       'Evaluator Demo',
       '+21650000101',
       r.id,
       'en',
       TRUE,
       NOW(),
       'Evaluation specialist',
       'Arabic Quality Platform',
       'Reviews submitted evaluation requests and prepares quality recommendations.',
       '#047857',
       'Africa/Tunis',
       'comfortable',
       TRUE
FROM roles r
WHERE r.code = 'ROLE_EVALUATOR'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'evaluator@arabic-quality.local');

INSERT INTO evaluation_requests
    (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT seed.request_number,
       ee.id,
       ee.manager_user_id,
       seed.status,
       DATE_SUB(NOW(), INTERVAL seed.age_hours HOUR),
       NULL,
       NULL,
       NULL,
       FALSE
FROM (
    SELECT 'REQ-2026-MAIN-EVAL001' AS request_number, 'Cairo Arabic House' AS entity_name, 'PENDING_REVIEW' AS status, 3 AS age_hours
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL002', 'Doha Language Hub', 'UNDER_EVALUATION', 7
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL003', 'Dubai Arabic Skills Center', 'UNDER_EVALUATION', 13
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL004', 'Riyadh Arabic Excellence', 'INFO_REQUESTED', 21
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL005', 'Paris Arabic Learning Center', 'PENDING_REVIEW', 30
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL006', 'Berlin Arabic Studio', 'UNDER_EVALUATION', 42
) seed
JOIN educational_entities ee ON ee.name = seed.entity_name
WHERE NOT EXISTS (
    SELECT 1 FROM evaluation_requests er WHERE er.request_number = seed.request_number
);

INSERT INTO evaluation_request_categories (request_id, category_id)
SELECT er.id, c.id
FROM evaluation_requests er
JOIN evaluation_categories c ON c.is_active = TRUE AND c.display_order BETWEEN 1 AND 6
WHERE er.request_number BETWEEN 'REQ-2026-MAIN-EVAL001' AND 'REQ-2026-MAIN-EVAL006'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_request_categories x
      WHERE x.request_id = er.id AND x.category_id = c.id
  );

INSERT INTO evaluation_answers
    (request_id, question_id, initial_value_id, final_value_id, answer_text, evaluator_note, edited_by_evaluator_id, edited_at)
SELECT er.id,
       q.id,
       init_val.id,
       NULL,
       CASE
           WHEN er.request_number = 'REQ-2026-MAIN-EVAL002'
               THEN 'The institution has a documented procedure, responsible staff, and recent examples available for review.'
           WHEN er.request_number = 'REQ-2026-MAIN-EVAL003'
               THEN CASE WHEN MOD(q.display_order, 2) = 0 THEN 'Yes.' ELSE '' END
           WHEN er.request_number = 'REQ-2026-MAIN-EVAL004'
               THEN 'Additional proof will be uploaded after the evaluator feedback is reviewed.'
           WHEN er.request_number = 'REQ-2026-MAIN-EVAL005'
               THEN 'Excellent.'
           WHEN er.request_number = 'REQ-2026-MAIN-EVAL006'
               THEN CONCAT('Evidence for ', c.name_en, ' is strong, recent, and linked to clear staff responsibilities.')
           ELSE CONCAT('The institution explains ', c.name_en, ' with clear records, named owners, and review dates.')
       END,
       NULL,
       NULL,
       NULL
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN evaluation_categories c ON c.id = erc.category_id
JOIN questions q ON q.category_id = c.id AND q.is_active = TRUE
JOIN evaluation_values init_val ON init_val.code = CASE
    WHEN er.request_number = 'REQ-2026-MAIN-EVAL003' THEN 'C'
    WHEN er.request_number = 'REQ-2026-MAIN-EVAL004' THEN 'B'
    WHEN er.request_number = 'REQ-2026-MAIN-EVAL005' THEN 'A'
    WHEN er.request_number = 'REQ-2026-MAIN-EVAL006' THEN ELT(1 + MOD(q.display_order, 2), 'A', 'B')
    ELSE ELT(1 + MOD(c.display_order + q.display_order, 3), 'A', 'B', 'B')
END
WHERE er.request_number BETWEEN 'REQ-2026-MAIN-EVAL001' AND 'REQ-2026-MAIN-EVAL006'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_answers a
      WHERE a.request_id = er.id AND a.question_id = q.id
  );

INSERT INTO evaluation_attachments
    (request_id, category_id, required_doc_id, file_uuid, original_name, mime_type, size_bytes, storage_path, sha256, uploaded_by_user_id)
SELECT er.id,
       d.category_id,
       d.id,
       UUID(),
       CONCAT(er.request_number, '-', REPLACE(LOWER(d.label_en), ' ', '-'), '.pdf'),
       'application/pdf',
       180000 + (d.id * 1600),
       CONCAT('./uploads/demo/real-evaluator/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':real-evaluator:', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number IN ('REQ-2026-MAIN-EVAL001', 'REQ-2026-MAIN-EVAL002', 'REQ-2026-MAIN-EVAL006')
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_attachments a
      WHERE a.request_id = er.id AND a.required_doc_id = d.id
  );

INSERT INTO evaluation_attachments
    (request_id, category_id, required_doc_id, file_uuid, original_name, mime_type, size_bytes, storage_path, sha256, uploaded_by_user_id)
SELECT er.id,
       d.category_id,
       d.id,
       UUID(),
       CONCAT(er.request_number, '-', REPLACE(LOWER(d.label_en), ' ', '-'), '.pdf'),
       'application/pdf',
       85000 + (d.id * 900),
       CONCAT('./uploads/demo/real-evaluator/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':partial-real-evaluator:', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number = 'REQ-2026-MAIN-EVAL004'
  AND d.is_mandatory = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_attachments a
      WHERE a.request_id = er.id AND a.required_doc_id = d.id
  );

INSERT INTO request_assignments
    (request_id, stage, assigned_user_id, assigned_by_user_id, is_auto, assigned_at, completed_at)
SELECT er.id,
       'INITIAL_EVALUATION',
       evaluator.id,
       assigner.id,
       FALSE,
       DATE_SUB(NOW(), INTERVAL seed.assigned_hours HOUR),
       NULL
FROM evaluation_requests er
JOIN (
    SELECT 'REQ-2026-MAIN-EVAL001' AS request_number, 2 AS assigned_hours
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL002', 6
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL003', 11
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL004', 20
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL005', 29
    UNION ALL SELECT 'REQ-2026-MAIN-EVAL006', 40
) seed ON seed.request_number = er.request_number
JOIN users evaluator ON evaluator.email = 'evaluator@arabic-quality.local'
JOIN users assigner ON assigner.id = (
    SELECT u.id
    FROM users u
    WHERE u.email IN ('admin@arabic-quality.local', 'admin.mona@demo.local', 'admin.reviewer.demo@demo.local')
    ORDER BY CASE
        WHEN u.email = 'admin@arabic-quality.local' THEN 1
        WHEN u.email = 'admin.mona@demo.local' THEN 2
        ELSE 3
    END
    LIMIT 1
)
WHERE NOT EXISTS (
    SELECT 1 FROM request_assignments x
    WHERE x.request_id = er.id AND x.stage = 'INITIAL_EVALUATION'
);

INSERT INTO notifications
    (user_id, event_type, title_ar, title_en, message_ar, message_en, related_entity, related_id, link_url, is_read, sent_via_email, created_at)
SELECT evaluator.id,
       'ASSIGNMENT_CREATED',
       'Evaluation request assigned',
       'Evaluation request assigned',
       CONCAT('Request ', er.request_number, ' is ready in your evaluation inbox.'),
       CONCAT('Request ', er.request_number, ' is ready in your evaluation inbox.'),
       'evaluation_request',
       er.id,
       CONCAT('/evaluation/', er.id),
       FALSE,
       FALSE,
       ra.assigned_at
FROM request_assignments ra
JOIN evaluation_requests er ON er.id = ra.request_id
JOIN users evaluator ON evaluator.id = ra.assigned_user_id
WHERE er.request_number BETWEEN 'REQ-2026-MAIN-EVAL001' AND 'REQ-2026-MAIN-EVAL006'
  AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = evaluator.id
        AND n.related_entity = 'evaluation_request'
        AND n.related_id = er.id
        AND n.event_type = 'ASSIGNMENT_CREATED'
  );

INSERT INTO audit_log
    (user_id, user_email, action_type, entity_type, entity_id, description, before_value, after_value, ip_address, user_agent, success, created_at)
SELECT assigner.id,
       assigner.email,
       'ASSIGN_REQUEST',
       'request_assignment',
       er.id,
       CONCAT('Seeded real evaluator inbox demo for ', er.request_number, '.'),
       JSON_OBJECT('status', 'PENDING_REVIEW'),
       JSON_OBJECT('status', er.status, 'assignedTo', evaluator.email),
       '10.0.0.91',
       'Codex real evaluator demo seed',
       TRUE,
       ra.assigned_at
FROM request_assignments ra
JOIN evaluation_requests er ON er.id = ra.request_id
JOIN users evaluator ON evaluator.id = ra.assigned_user_id
JOIN users assigner ON assigner.id = ra.assigned_by_user_id
WHERE er.request_number BETWEEN 'REQ-2026-MAIN-EVAL001' AND 'REQ-2026-MAIN-EVAL006'
  AND NOT EXISTS (
      SELECT 1 FROM audit_log a
      WHERE a.entity_type = 'request_assignment'
        AND a.entity_id = er.id
        AND a.description = CONCAT('Seeded real evaluator inbox demo for ', er.request_number, '.')
  );
