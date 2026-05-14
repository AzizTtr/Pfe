-- Demo business data to make the platform easier to explore.
-- Emails intentionally use demo.local so they do not collide with Keycloak imported accounts.

INSERT INTO users (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at)
SELECT '10000000-0000-0000-0000-000000000001', 'manager.rabat@demo.local', 'Rabat Arabic Center Manager', '+212600000001', r.id, 'en', TRUE, NOW()
FROM roles r
WHERE r.code = 'ROLE_ENTITY_MANAGER'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager.rabat@demo.local');

INSERT INTO users (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at)
SELECT '10000000-0000-0000-0000-000000000002', 'manager.tunis@demo.local', 'Tunis Language Institute Manager', '+216500000002', r.id, 'ar', TRUE, NOW()
FROM roles r
WHERE r.code = 'ROLE_ENTITY_MANAGER'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager.tunis@demo.local');

INSERT INTO users (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at)
SELECT '10000000-0000-0000-0000-000000000003', 'evaluator.demo@demo.local', 'Demo Evaluation Specialist', '+216500000003', r.id, 'en', TRUE, NOW()
FROM roles r
WHERE r.code = 'ROLE_EVALUATOR'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'evaluator.demo@demo.local');

INSERT INTO users (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at)
SELECT '10000000-0000-0000-0000-000000000004', 'admin.reviewer.demo@demo.local', 'Demo Administrative Reviewer', '+216500000004', r.id, 'en', TRUE, NOW()
FROM roles r
WHERE r.code = 'ROLE_ADMIN_REVIEWER'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.reviewer.demo@demo.local');

INSERT INTO users (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at)
SELECT '10000000-0000-0000-0000-000000000005', 'field.reviewer.demo@demo.local', 'Demo Field Reviewer', '+216500000005', r.id, 'en', TRUE, NOW()
FROM roles r
WHERE r.code = 'ROLE_FIELD_REVIEWER'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'field.reviewer.demo@demo.local');

INSERT INTO educational_entities (name, country, city, description, manager_user_id, is_active)
SELECT 'Rabat Arabic Center', 'Morocco', 'Rabat',
       'Demo institution with several evaluation requests for dashboard and workflow testing.',
       u.id, TRUE
FROM users u
WHERE u.email = 'manager.rabat@demo.local'
  AND NOT EXISTS (SELECT 1 FROM educational_entities WHERE name = 'Rabat Arabic Center');

INSERT INTO educational_entities (name, country, city, description, manager_user_id, is_active)
SELECT 'Tunis Language Institute', 'Tunisia', 'Tunis',
       'Demo institution used to show registration approval and request tracking.',
       u.id, TRUE
FROM users u
WHERE u.email = 'manager.tunis@demo.local'
  AND NOT EXISTS (SELECT 1 FROM educational_entities WHERE name = 'Tunis Language Institute');

INSERT INTO registration_requests (entity_name, manager_name, country, city, email, phone, description, status, reviewed_at)
SELECT 'Casablanca Arabic Academy', 'Hassan Amrani', 'Morocco', 'Casablanca', 'hassan.amrani@demo.local', '+212600001010',
       'Pending demo registration request waiting for platform admin review.', 'PENDING', NULL
WHERE NOT EXISTS (SELECT 1 FROM registration_requests WHERE email = 'hassan.amrani@demo.local');

INSERT INTO registration_requests (entity_name, manager_name, country, city, email, phone, description, status, reviewed_at)
SELECT 'Tunis Language Institute', 'Tunis Language Institute Manager', 'Tunisia', 'Tunis', 'manager.tunis@demo.local', '+216500000002',
       'Approved demo registration linked to a seeded educational entity.', 'APPROVED', DATE_SUB(NOW(), INTERVAL 10 DAY)
WHERE NOT EXISTS (SELECT 1 FROM registration_requests WHERE email = 'manager.tunis@demo.local');

INSERT INTO registration_requests (entity_name, manager_name, country, city, email, phone, description, status, rejection_reason, reviewed_at)
SELECT 'Incomplete Language School', 'Nadia Salem', 'Algeria', 'Algiers', 'nadia.salem@demo.local', '+213600001011',
       'Rejected demo registration used to populate admin status filters.', 'REJECTED',
       'Missing legal authorization document.', DATE_SUB(NOW(), INTERVAL 6 DAY)
WHERE NOT EXISTS (SELECT 1 FROM registration_requests WHERE email = 'nadia.salem@demo.local');

INSERT INTO evaluation_requests (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT 'REQ-2026-DEMO001', ee.id, u.id, 'PENDING_REVIEW', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, NULL, NULL, FALSE
FROM educational_entities ee
JOIN users u ON u.id = ee.manager_user_id
WHERE ee.name = 'Rabat Arabic Center'
  AND NOT EXISTS (SELECT 1 FROM evaluation_requests WHERE request_number = 'REQ-2026-DEMO001');

INSERT INTO evaluation_requests (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT 'REQ-2026-DEMO002', ee.id, u.id, 'UNDER_EVALUATION', DATE_SUB(NOW(), INTERVAL 12 DAY), NULL, NULL, NULL, FALSE
FROM educational_entities ee
JOIN users u ON u.id = ee.manager_user_id
WHERE ee.name = 'Rabat Arabic Center'
  AND NOT EXISTS (SELECT 1 FROM evaluation_requests WHERE request_number = 'REQ-2026-DEMO002');

INSERT INTO evaluation_requests (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT 'REQ-2026-DEMO003', ee.id, u.id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 30 DAY), 28.00, 87.50, gs.id, TRUE
FROM educational_entities ee
JOIN users u ON u.id = ee.manager_user_id
JOIN grading_scale gs ON gs.label_en = 'Very Good'
WHERE ee.name = 'Tunis Language Institute'
  AND NOT EXISTS (SELECT 1 FROM evaluation_requests WHERE request_number = 'REQ-2026-DEMO003');

INSERT INTO evaluation_requests (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT 'REQ-2026-DEMO004', ee.id, u.id, 'DRAFT', NULL, NULL, NULL, NULL, FALSE
FROM educational_entities ee
JOIN users u ON u.id = ee.manager_user_id
WHERE ee.name = 'Tunis Language Institute'
  AND NOT EXISTS (SELECT 1 FROM evaluation_requests WHERE request_number = 'REQ-2026-DEMO004');

INSERT INTO evaluation_request_categories (request_id, category_id)
SELECT er.id, c.id
FROM evaluation_requests er
JOIN evaluation_categories c ON c.code IN ('CURRICULUM', 'TEACHING_STAFF', 'LEARNING_ENV', 'ASSESSMENT')
WHERE er.request_number IN ('REQ-2026-DEMO001', 'REQ-2026-DEMO002', 'REQ-2026-DEMO003')
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_request_categories x WHERE x.request_id = er.id AND x.category_id = c.id
  );

INSERT INTO evaluation_request_categories (request_id, category_id)
SELECT er.id, c.id
FROM evaluation_requests er
JOIN evaluation_categories c ON c.code IN ('CURRICULUM', 'ASSESSMENT')
WHERE er.request_number = 'REQ-2026-DEMO004'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_request_categories x WHERE x.request_id = er.id AND x.category_id = c.id
  );

INSERT INTO evaluation_answers (request_id, question_id, initial_value_id, final_value_id, answer_text, evaluator_note, edited_by_evaluator_id, edited_at)
SELECT er.id, q.id,
       init_val.id,
       CASE WHEN er.request_number = 'REQ-2026-DEMO003' THEN final_val.id ELSE NULL END,
       CONCAT('Demo self-assessment evidence for ', c.name_en, '.'),
       CASE WHEN er.request_number = 'REQ-2026-DEMO003' THEN 'Reviewed and accepted with minor recommendations.' ELSE NULL END,
       CASE WHEN er.request_number = 'REQ-2026-DEMO003' THEN evaluator.id ELSE NULL END,
       CASE WHEN er.request_number = 'REQ-2026-DEMO003' THEN DATE_SUB(NOW(), INTERVAL 20 DAY) ELSE NULL END
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN evaluation_categories c ON c.id = erc.category_id
JOIN questions q ON q.category_id = c.id
JOIN evaluation_values init_val ON init_val.code = CASE
    WHEN c.code = 'CURRICULUM' THEN 'A'
    WHEN c.code = 'TEACHING_STAFF' THEN 'B'
    WHEN c.code = 'LEARNING_ENV' THEN 'B'
    ELSE 'A'
END
JOIN evaluation_values final_val ON final_val.code = CASE
    WHEN c.code = 'LEARNING_ENV' THEN 'C'
    ELSE 'B'
END
LEFT JOIN users evaluator ON evaluator.email = 'evaluator.demo@demo.local'
WHERE er.request_number IN ('REQ-2026-DEMO001', 'REQ-2026-DEMO002', 'REQ-2026-DEMO003', 'REQ-2026-DEMO004')
  AND NOT EXISTS (SELECT 1 FROM evaluation_answers a WHERE a.request_id = er.id AND a.question_id = q.id);

INSERT INTO evaluation_attachments
    (request_id, category_id, required_doc_id, file_uuid, original_name, mime_type, size_bytes, storage_path, sha256, uploaded_by_user_id)
SELECT er.id, d.category_id, d.id,
       UUID(),
       CONCAT(REPLACE(LOWER(d.label_en), ' ', '-'), '.pdf'),
       'application/pdf',
       245760,
       CONCAT('./uploads/demo/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number IN ('REQ-2026-DEMO001', 'REQ-2026-DEMO002', 'REQ-2026-DEMO003')
  AND d.is_mandatory = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_attachments a WHERE a.request_id = er.id AND a.required_doc_id = d.id
  );

INSERT INTO request_assignments (request_id, stage, assigned_user_id, assigned_by_user_id, is_auto, assigned_at, completed_at)
SELECT er.id, 'INITIAL_EVALUATION', evaluator.id, admin_user.id, TRUE, DATE_SUB(NOW(), INTERVAL 11 DAY), NULL
FROM evaluation_requests er
JOIN users evaluator ON evaluator.email = 'evaluator.demo@demo.local'
JOIN users admin_user ON admin_user.email = 'admin.reviewer.demo@demo.local'
WHERE er.request_number = 'REQ-2026-DEMO002'
  AND NOT EXISTS (SELECT 1 FROM request_assignments x WHERE x.request_id = er.id AND x.stage = 'INITIAL_EVALUATION');

INSERT INTO request_assignments (request_id, stage, assigned_user_id, assigned_by_user_id, is_auto, assigned_at, completed_at)
SELECT er.id, 'INITIAL_EVALUATION', evaluator.id, admin_user.id, TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY)
FROM evaluation_requests er
JOIN users evaluator ON evaluator.email = 'evaluator.demo@demo.local'
JOIN users admin_user ON admin_user.email = 'admin.reviewer.demo@demo.local'
WHERE er.request_number = 'REQ-2026-DEMO003'
  AND NOT EXISTS (SELECT 1 FROM request_assignments x WHERE x.request_id = er.id AND x.stage = 'INITIAL_EVALUATION');

INSERT INTO workflow_decisions (request_id, stage, decision, notes, decided_by_user_id, decided_at)
SELECT er.id, 'INITIAL_EVALUATION', 'APPROVED', 'Demo request passed initial evaluation.', evaluator.id, DATE_SUB(NOW(), INTERVAL 23 DAY)
FROM evaluation_requests er
JOIN users evaluator ON evaluator.email = 'evaluator.demo@demo.local'
WHERE er.request_number = 'REQ-2026-DEMO003'
  AND NOT EXISTS (SELECT 1 FROM workflow_decisions x WHERE x.request_id = er.id AND x.stage = 'INITIAL_EVALUATION');

INSERT INTO notifications (user_id, event_type, title_ar, title_en, message_ar, message_en, related_entity, related_id, link_url, is_read, sent_via_email)
SELECT er.submitted_by_user_id, 'REQUEST_SUBMITTED',
       'Demo evaluation request submitted', 'Evaluation request submitted',
       'The demo evaluation request has been submitted successfully.', 'The demo evaluation request has been submitted successfully.',
       'evaluation_request', er.id, CONCAT('/my-requests/', er.id), FALSE, FALSE
FROM evaluation_requests er
WHERE er.request_number = 'REQ-2026-DEMO001'
  AND NOT EXISTS (
      SELECT 1 FROM notifications n WHERE n.user_id = er.submitted_by_user_id AND n.related_entity = 'evaluation_request' AND n.related_id = er.id
  );
