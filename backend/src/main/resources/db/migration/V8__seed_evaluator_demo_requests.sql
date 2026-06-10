-- Extra evaluator inbox demos, including fraud/risk detection scenarios.

INSERT INTO evaluation_requests
    (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT seed.request_number, ee.id, ee.manager_user_id, 'UNDER_EVALUATION',
       DATE_SUB(NOW(), INTERVAL seed.age_days DAY), NULL, NULL, NULL, FALSE
FROM (
    SELECT 'REQ-2026-EVAL101' AS request_number, 'Cairo Arabic House' AS entity_name, 1 AS age_days
    UNION ALL SELECT 'REQ-2026-EVAL102', 'Doha Language Hub', 2
    UNION ALL SELECT 'REQ-2026-EVAL103', 'Dubai Arabic Skills Center', 3
    UNION ALL SELECT 'REQ-2026-EVAL104', 'Riyadh Arabic Excellence', 4
    UNION ALL SELECT 'REQ-2026-EVAL105', 'Paris Arabic Learning Center', 5
    UNION ALL SELECT 'REQ-2026-EVAL106', 'Berlin Arabic Studio', 6
) seed
JOIN educational_entities ee ON ee.name = seed.entity_name
WHERE NOT EXISTS (
    SELECT 1 FROM evaluation_requests er WHERE er.request_number = seed.request_number
);

INSERT INTO evaluation_request_categories (request_id, category_id)
SELECT er.id, c.id
FROM evaluation_requests er
JOIN evaluation_categories c ON c.is_active = TRUE AND c.display_order BETWEEN 1 AND 6
WHERE er.request_number BETWEEN 'REQ-2026-EVAL101' AND 'REQ-2026-EVAL106'
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
           WHEN er.request_number = 'REQ-2026-EVAL102'
               THEN 'We have a complete documented process and all evidence is available for review.'
           WHEN er.request_number = 'REQ-2026-EVAL103'
               THEN CASE WHEN MOD(q.display_order, 2) = 0 THEN 'Yes.' ELSE '' END
           WHEN er.request_number = 'REQ-2026-EVAL104'
               THEN 'Excellent.'
           WHEN er.request_number = 'REQ-2026-EVAL105'
               THEN CONCAT('The institution provided partial evidence for ', c.name_en, ', but the reviewer should verify the supporting document quality.')
           WHEN er.request_number = 'REQ-2026-EVAL106'
               THEN CONCAT('Detailed evidence is available for ', c.name_en, '. The process is described, monitored, and reviewed with staff feedback.')
           ELSE CONCAT('Clear evidence is provided for ', c.name_en, '. The institution describes responsibilities, review rhythm, and supporting records.')
       END,
       NULL,
       NULL,
       NULL
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN evaluation_categories c ON c.id = erc.category_id
JOIN questions q ON q.category_id = c.id
JOIN evaluation_values init_val ON init_val.code = CASE
    WHEN er.request_number = 'REQ-2026-EVAL103' THEN 'C'
    WHEN er.request_number = 'REQ-2026-EVAL104' THEN 'A'
    WHEN er.request_number = 'REQ-2026-EVAL105' THEN ELT(1 + MOD(q.display_order, 3), 'B', 'C', 'B')
    WHEN er.request_number = 'REQ-2026-EVAL106' THEN ELT(1 + MOD(q.display_order, 2), 'A', 'B')
    ELSE ELT(1 + MOD(c.display_order + q.display_order, 3), 'A', 'B', 'B')
END
WHERE er.request_number BETWEEN 'REQ-2026-EVAL101' AND 'REQ-2026-EVAL106'
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
       210000 + (d.id * 2048),
       CONCAT('./uploads/demo/evaluator-inbox/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':evaluator-demo:', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number IN ('REQ-2026-EVAL101', 'REQ-2026-EVAL102', 'REQ-2026-EVAL106')
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
       95000 + (d.id * 1024),
       CONCAT('./uploads/demo/evaluator-inbox/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':partial-evidence:', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number = 'REQ-2026-EVAL105'
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
    SELECT 'REQ-2026-EVAL101' AS request_number, 'evaluator.sara@demo.local' AS evaluator_email, 4 AS assigned_hours
    UNION ALL SELECT 'REQ-2026-EVAL102', 'evaluator.sara@demo.local', 8
    UNION ALL SELECT 'REQ-2026-EVAL103', 'evaluator.omar@demo.local', 12
    UNION ALL SELECT 'REQ-2026-EVAL104', 'evaluator.omar@demo.local', 18
    UNION ALL SELECT 'REQ-2026-EVAL105', 'evaluator.demo@demo.local', 22
    UNION ALL SELECT 'REQ-2026-EVAL106', 'evaluator.demo@demo.local', 28
) seed ON seed.request_number = er.request_number
JOIN users evaluator ON evaluator.email = seed.evaluator_email
JOIN users assigner ON assigner.email = 'admin.mona@demo.local'
WHERE NOT EXISTS (
    SELECT 1 FROM request_assignments x
    WHERE x.request_id = er.id AND x.stage = 'INITIAL_EVALUATION'
);

INSERT INTO notifications
    (user_id, event_type, title_ar, title_en, message_ar, message_en, related_entity, related_id, link_url, is_read, sent_via_email, created_at)
SELECT evaluator.id,
       'ASSIGNMENT_CREATED',
       'تم إسناد طلب تقييم',
       'Evaluation request assigned',
       CONCAT('تم إسناد الطلب ', er.request_number, ' إلى صندوق التقييم الخاص بك.'),
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
WHERE er.request_number BETWEEN 'REQ-2026-EVAL101' AND 'REQ-2026-EVAL106'
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
       CONCAT('Seeded evaluator demo assignment for ', er.request_number, '.'),
       JSON_OBJECT('status', 'PENDING_REVIEW'),
       JSON_OBJECT('status', er.status, 'assignedTo', evaluator.email),
       '10.0.0.88',
       'Codex evaluator demo seed',
       TRUE,
       ra.assigned_at
FROM request_assignments ra
JOIN evaluation_requests er ON er.id = ra.request_id
JOIN users evaluator ON evaluator.id = ra.assigned_user_id
JOIN users assigner ON assigner.email = 'admin.mona@demo.local'
WHERE er.request_number BETWEEN 'REQ-2026-EVAL101' AND 'REQ-2026-EVAL106'
  AND NOT EXISTS (
      SELECT 1 FROM audit_log a
      WHERE a.entity_type = 'request_assignment'
        AND a.entity_id = er.id
        AND a.description = CONCAT('Seeded evaluator demo assignment for ', er.request_number, '.')
  );
