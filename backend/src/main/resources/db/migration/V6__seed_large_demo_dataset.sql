-- Larger demo dataset for dashboards, reports, workflow screens, and request lists.

INSERT INTO users
    (kc_id, email, full_name, phone, role_id, preferred_lang, is_active, last_login_at,
     job_title, organization, bio, avatar_color, timezone, dashboard_density, email_notifications)
SELECT seed.kc_id, seed.email, seed.full_name, seed.phone, r.id, seed.lang, TRUE,
       DATE_SUB(NOW(), INTERVAL seed.last_login_days DAY),
       seed.job_title, seed.organization, seed.bio, seed.avatar_color, seed.timezone, seed.density, TRUE
FROM (
    SELECT '20000000-0000-0000-0000-000000000001' AS kc_id, 'manager.cairo@demo.local' AS email, 'Cairo Arabic House Manager' AS full_name, '+201000000001' AS phone, 'ROLE_ENTITY_MANAGER' AS role_code, 'en' AS lang, 1 AS last_login_days, 'Academic director' AS job_title, 'Cairo Arabic House' AS organization, 'Coordinates Arabic programs for adult learners.' AS bio, '#0f766e' AS avatar_color, 'Africa/Cairo' AS timezone, 'comfortable' AS density
    UNION ALL SELECT '20000000-0000-0000-0000-000000000002', 'manager.doha@demo.local', 'Doha Language Hub Manager', '+97450000002', 'ROLE_ENTITY_MANAGER', 'ar', 2, 'Program manager', 'Doha Language Hub', 'Leads blended Arabic learning programs.', '#1d4ed8', 'Asia/Qatar', 'compact'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000003', 'manager.dubai@demo.local', 'Dubai Arabic Skills Manager', '+971500000003', 'ROLE_ENTITY_MANAGER', 'en', 3, 'Training manager', 'Dubai Arabic Skills Center', 'Manages workplace Arabic training tracks.', '#7c3aed', 'Asia/Dubai', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000004', 'manager.jeddah@demo.local', 'Jeddah Arabic Pathways Manager', '+966500000004', 'ROLE_ENTITY_MANAGER', 'ar', 4, 'Institution manager', 'Jeddah Arabic Pathways', 'Follows learner outcomes and certification readiness.', '#be123c', 'Asia/Riyadh', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000005', 'manager.amman@demo.local', 'Amman Language Bridge Manager', '+962790000005', 'ROLE_ENTITY_MANAGER', 'en', 5, 'Quality coordinator', 'Amman Language Bridge', 'Prepares evidence files for quality review.', '#c2410c', 'Asia/Amman', 'compact'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000006', 'manager.muscat@demo.local', 'Muscat Arabic Academy Manager', '+96890000006', 'ROLE_ENTITY_MANAGER', 'ar', 6, 'Operations manager', 'Muscat Arabic Academy', 'Improves daily operations and learner support.', '#2563eb', 'Asia/Muscat', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000007', 'manager.riyadh@demo.local', 'Riyadh Arabic Excellence Manager', '+966500000007', 'ROLE_ENTITY_MANAGER', 'en', 7, 'Center director', 'Riyadh Arabic Excellence', 'Supervises curriculum and instructor development.', '#059669', 'Asia/Riyadh', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000008', 'manager.istanbul@demo.local', 'Istanbul Arabic Institute Manager', '+905300000008', 'ROLE_ENTITY_MANAGER', 'en', 8, 'Academic coordinator', 'Istanbul Arabic Institute', 'Supports multicultural Arabic language cohorts.', '#9333ea', 'Europe/Istanbul', 'compact'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000009', 'manager.paris@demo.local', 'Paris Arabic Learning Manager', '+33100000009', 'ROLE_ENTITY_MANAGER', 'en', 9, 'Learner success lead', 'Paris Arabic Learning Center', 'Focuses on learner support and communication.', '#0891b2', 'Europe/Paris', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000010', 'manager.berlin@demo.local', 'Berlin Arabic Studio Manager', '+493000000010', 'ROLE_ENTITY_MANAGER', 'en', 10, 'Digital learning lead', 'Berlin Arabic Studio', 'Runs online and hybrid Arabic programs.', '#4f46e5', 'Europe/Berlin', 'compact'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000011', 'evaluator.sara@demo.local', 'Sara Demo Evaluator', '+216500000011', 'ROLE_EVALUATOR', 'en', 1, 'Senior evaluator', 'Arabic Quality Platform', 'Reviews evidence and writes recommendations.', '#047857', 'Africa/Tunis', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000012', 'evaluator.omar@demo.local', 'Omar Demo Evaluator', '+216500000012', 'ROLE_EVALUATOR', 'ar', 1, 'Evaluation specialist', 'Arabic Quality Platform', 'Validates assessment evidence and scores.', '#0369a1', 'Africa/Tunis', 'comfortable'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000013', 'admin.mona@demo.local', 'Mona Demo Admin Reviewer', '+216500000013', 'ROLE_ADMIN_REVIEWER', 'ar', 2, 'Administrative reviewer', 'Arabic Quality Platform', 'Reviews administrative compliance files.', '#be123c', 'Africa/Tunis', 'compact'
    UNION ALL SELECT '20000000-0000-0000-0000-000000000014', 'field.khaled@demo.local', 'Khaled Demo Field Reviewer', '+216500000014', 'ROLE_FIELD_REVIEWER', 'en', 2, 'Field reviewer', 'Arabic Quality Platform', 'Confirms field evidence and visit outcomes.', '#c2410c', 'Africa/Tunis', 'comfortable'
) seed
JOIN roles r ON r.code = seed.role_code
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = seed.email);

INSERT INTO educational_entities (name, country, city, description, manager_user_id, is_active)
SELECT seed.name, seed.country, seed.city, seed.description, u.id, TRUE
FROM (
    SELECT 'Cairo Arabic House' AS name, 'Egypt' AS country, 'Cairo' AS city, 'Large urban Arabic center with intensive and evening programs.' AS description, 'manager.cairo@demo.local' AS manager_email
    UNION ALL SELECT 'Doha Language Hub', 'Qatar', 'Doha', 'Blended learning institution with strong digital resources.', 'manager.doha@demo.local'
    UNION ALL SELECT 'Dubai Arabic Skills Center', 'United Arab Emirates', 'Dubai', 'Professional Arabic training provider for companies and adults.', 'manager.dubai@demo.local'
    UNION ALL SELECT 'Jeddah Arabic Pathways', 'Saudi Arabia', 'Jeddah', 'Arabic pathway program serving international learners.', 'manager.jeddah@demo.local'
    UNION ALL SELECT 'Amman Language Bridge', 'Jordan', 'Amman', 'Community-oriented language center with cultural programs.', 'manager.amman@demo.local'
    UNION ALL SELECT 'Muscat Arabic Academy', 'Oman', 'Muscat', 'Medium-sized academy preparing for quality certification.', 'manager.muscat@demo.local'
    UNION ALL SELECT 'Riyadh Arabic Excellence', 'Saudi Arabia', 'Riyadh', 'Institution focused on curriculum quality and teacher development.', 'manager.riyadh@demo.local'
    UNION ALL SELECT 'Istanbul Arabic Institute', 'Turkey', 'Istanbul', 'Arabic institute serving multilingual learners.', 'manager.istanbul@demo.local'
    UNION ALL SELECT 'Paris Arabic Learning Center', 'France', 'Paris', 'European Arabic learning center with hybrid delivery.', 'manager.paris@demo.local'
    UNION ALL SELECT 'Berlin Arabic Studio', 'Germany', 'Berlin', 'Digital-first studio for Arabic language learners.', 'manager.berlin@demo.local'
) seed
JOIN users u ON u.email = seed.manager_email
WHERE NOT EXISTS (SELECT 1 FROM educational_entities ee WHERE ee.name = seed.name);

INSERT INTO registration_requests
    (entity_name, manager_name, country, city, email, phone, description, status, rejection_reason, reviewed_by_user_id, reviewed_at)
SELECT seed.entity_name, seed.manager_name, seed.country, seed.city, seed.email, seed.phone,
       seed.description, seed.status, seed.rejection_reason,
       CASE WHEN seed.status <> 'PENDING' THEN reviewer.id ELSE NULL END,
       CASE WHEN seed.status <> 'PENDING' THEN DATE_SUB(NOW(), INTERVAL seed.review_days DAY) ELSE NULL END
FROM (
    SELECT 'Alexandria Arabic School' AS entity_name, 'Mariam Fathy' AS manager_name, 'Egypt' AS country, 'Alexandria' AS city, 'mariam.fathy@demo.local' AS email, '+201000001101' AS phone, 'New registration with complete identity documents.' AS description, 'PENDING' AS status, NULL AS rejection_reason, 0 AS review_days
    UNION ALL SELECT 'Kuwait Arabic Center', 'Yousef Al Sabah', 'Kuwait', 'Kuwait City', 'yousef.sabah@demo.local', '+96550001102', 'Pending registration for a growing Arabic center.', 'PENDING', NULL, 0
    UNION ALL SELECT 'Manama Language Center', 'Fatima Nasser', 'Bahrain', 'Manama', 'fatima.nasser@demo.local', '+97336001103', 'Pending registration awaiting document review.', 'PENDING', NULL, 0
    UNION ALL SELECT 'Tripoli Arabic Academy', 'Amina Qaramanli', 'Libya', 'Tripoli', 'amina.tripoli@demo.local', '+21891001104', 'Pending registration submitted this week.', 'PENDING', NULL, 0
    UNION ALL SELECT 'Nouakchott Arabic Institute', 'Salem Ould Ahmed', 'Mauritania', 'Nouakchott', 'salem.ahmed@demo.local', '+22246001105', 'Pending registration with legal authorization attached.', 'PENDING', NULL, 0
    UNION ALL SELECT 'Cairo Arabic House', 'Cairo Arabic House Manager', 'Egypt', 'Cairo', 'manager.cairo@demo.local', '+201000000001', 'Approved demo registration linked to seeded entity.', 'APPROVED', NULL, 18
    UNION ALL SELECT 'Doha Language Hub', 'Doha Language Hub Manager', 'Qatar', 'Doha', 'manager.doha@demo.local', '+97450000002', 'Approved demo registration linked to seeded entity.', 'APPROVED', NULL, 16
    UNION ALL SELECT 'Dubai Arabic Skills Center', 'Dubai Arabic Skills Manager', 'United Arab Emirates', 'Dubai', 'manager.dubai@demo.local', '+971500000003', 'Approved demo registration linked to seeded entity.', 'APPROVED', NULL, 15
    UNION ALL SELECT 'Jeddah Arabic Pathways', 'Jeddah Arabic Pathways Manager', 'Saudi Arabia', 'Jeddah', 'manager.jeddah@demo.local', '+966500000004', 'Approved demo registration linked to seeded entity.', 'APPROVED', NULL, 14
    UNION ALL SELECT 'Old File Language Center', 'Rania Haddad', 'Lebanon', 'Beirut', 'rania.haddad@demo.local', '+96170001106', 'Rejected because the commercial registration was expired.', 'REJECTED', 'Commercial registration document is expired.', 11
    UNION ALL SELECT 'Unclear Arabic Program', 'Samir Najjar', 'Jordan', 'Zarqa', 'samir.najjar@demo.local', '+96279001107', 'Rejected because academic scope was not clear.', 'REJECTED', 'Program description does not match accreditation scope.', 9
) seed
LEFT JOIN users reviewer ON reviewer.email = 'admin.mona@demo.local'
WHERE NOT EXISTS (SELECT 1 FROM registration_requests rr WHERE rr.email = seed.email);

INSERT INTO registration_documents
    (registration_id, file_uuid, original_name, mime_type, size_bytes, storage_path, sha256)
SELECT rr.id, UUID(), seed.original_name, 'application/pdf', seed.size_bytes,
       CONCAT('./uploads/demo/registrations/', rr.id, '/', seed.original_name),
       SHA2(CONCAT(rr.email, ':', seed.original_name), 256)
FROM registration_requests rr
JOIN (
    SELECT 'legal-authorization.pdf' AS original_name, 312000 AS size_bytes
    UNION ALL SELECT 'institution-profile.pdf', 428000
    UNION ALL SELECT 'manager-id.pdf', 186000
) seed
WHERE rr.email LIKE '%@demo.local'
  AND rr.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
  AND NOT EXISTS (
      SELECT 1 FROM registration_documents d
      WHERE d.registration_id = rr.id
        AND d.original_name = seed.original_name
  );

INSERT INTO evaluation_requests
    (request_number, entity_id, submitted_by_user_id, status, submitted_at, final_score, final_percentage, final_grade_id, is_locked)
SELECT seed.request_number, ee.id, ee.manager_user_id, seed.status,
       CASE WHEN seed.status = 'DRAFT' THEN NULL ELSE DATE_SUB(NOW(), INTERVAL seed.age_days DAY) END,
       seed.final_score, seed.final_percentage, gs.id, seed.is_locked
FROM (
    SELECT 'REQ-2026-DEMO010' AS request_number, 'Cairo Arabic House' AS entity_name, 'PENDING_REVIEW' AS status, 2 AS age_days, NULL AS final_score, NULL AS final_percentage, NULL AS grade_label, FALSE AS is_locked
    UNION ALL SELECT 'REQ-2026-DEMO011', 'Cairo Arabic House', 'UNDER_EVALUATION', 8, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO012', 'Doha Language Hub', 'PENDING_ADMIN', 11, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO013', 'Doha Language Hub', 'COMPLETED', 45, 55.00, 91.67, 'Excellent', TRUE
    UNION ALL SELECT 'REQ-2026-DEMO014', 'Dubai Arabic Skills Center', 'INFO_REQUESTED', 5, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO015', 'Dubai Arabic Skills Center', 'APPROVED_ADMIN', 18, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO016', 'Jeddah Arabic Pathways', 'PENDING_FIELD', 13, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO017', 'Jeddah Arabic Pathways', 'COMPLETED', 62, 41.00, 68.33, 'Good', TRUE
    UNION ALL SELECT 'REQ-2026-DEMO018', 'Amman Language Bridge', 'DRAFT', 0, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO019', 'Amman Language Bridge', 'REJECTED_INITIAL', 22, NULL, NULL, NULL, TRUE
    UNION ALL SELECT 'REQ-2026-DEMO020', 'Muscat Arabic Academy', 'PENDING_REVIEW', 1, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO021', 'Muscat Arabic Academy', 'UNDER_EVALUATION', 7, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO022', 'Riyadh Arabic Excellence', 'APPROVED_FINAL', 29, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO023', 'Riyadh Arabic Excellence', 'COMPLETED', 90, 50.00, 83.33, 'Very Good', TRUE
    UNION ALL SELECT 'REQ-2026-DEMO024', 'Istanbul Arabic Institute', 'PENDING_ADMIN', 14, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO025', 'Istanbul Arabic Institute', 'REJECTED_ADMIN', 31, NULL, NULL, NULL, TRUE
    UNION ALL SELECT 'REQ-2026-DEMO026', 'Paris Arabic Learning Center', 'PENDING_FIELD', 17, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO027', 'Paris Arabic Learning Center', 'COMPLETED', 77, 47.00, 78.33, 'Very Good', TRUE
    UNION ALL SELECT 'REQ-2026-DEMO028', 'Berlin Arabic Studio', 'INFO_REQUESTED', 6, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO029', 'Berlin Arabic Studio', 'COMPLETED', 120, 34.00, 56.67, 'Acceptable', TRUE
    UNION ALL SELECT 'REQ-2026-DEMO030', 'Tunis Language Institute', 'APPROVED_INITIAL', 25, NULL, NULL, NULL, FALSE
    UNION ALL SELECT 'REQ-2026-DEMO031', 'Rabat Arabic Center', 'REJECTED_FINAL', 40, NULL, NULL, NULL, TRUE
) seed
JOIN educational_entities ee ON ee.name = seed.entity_name
LEFT JOIN grading_scale gs ON gs.label_en = seed.grade_label
WHERE NOT EXISTS (SELECT 1 FROM evaluation_requests er WHERE er.request_number = seed.request_number);

INSERT INTO evaluation_request_categories (request_id, category_id)
SELECT er.id, c.id
FROM evaluation_requests er
JOIN evaluation_categories c ON (
    (er.status = 'DRAFT' AND c.display_order BETWEEN 1 AND 5)
    OR (er.status <> 'DRAFT' AND c.is_active = TRUE)
)
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_request_categories x
      WHERE x.request_id = er.id AND x.category_id = c.id
  );

INSERT INTO evaluation_answers
    (request_id, question_id, initial_value_id, final_value_id, answer_text, evaluator_note, edited_by_evaluator_id, edited_at)
SELECT er.id, q.id,
       init_val.id,
       CASE WHEN er.status IN ('COMPLETED','APPROVED_FINAL','REJECTED_FINAL','APPROVED_ADMIN','REJECTED_ADMIN','APPROVED_INITIAL','REJECTED_INITIAL')
            THEN final_val.id ELSE NULL END,
       CONCAT('Demo evidence: ', c.name_en, ' is documented for ', ee.name, '.'),
       CASE
           WHEN er.status = 'COMPLETED' THEN CONCAT('Final review note for ', c.name_en, ': evidence checked and scored.')
           WHEN er.status LIKE 'REJECTED%' THEN CONCAT('Review note for ', c.name_en, ': improvement evidence is required.')
           WHEN er.status LIKE 'APPROVED%' THEN CONCAT('Review note for ', c.name_en, ': accepted for the next workflow stage.')
           ELSE NULL
       END,
       CASE WHEN er.status IN ('COMPLETED','APPROVED_FINAL','REJECTED_FINAL','APPROVED_ADMIN','REJECTED_ADMIN','APPROVED_INITIAL','REJECTED_INITIAL')
            THEN evaluator.id ELSE NULL END,
       CASE WHEN er.status IN ('COMPLETED','APPROVED_FINAL','REJECTED_FINAL','APPROVED_ADMIN','REJECTED_ADMIN','APPROVED_INITIAL','REJECTED_INITIAL')
            THEN DATE_SUB(NOW(), INTERVAL GREATEST(1, TIMESTAMPDIFF(DAY, er.submitted_at, NOW()) - 2) DAY) ELSE NULL END
FROM evaluation_requests er
JOIN educational_entities ee ON ee.id = er.entity_id
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN evaluation_categories c ON c.id = erc.category_id
JOIN questions q ON q.category_id = c.id
JOIN evaluation_values init_val ON init_val.code = ELT(1 + MOD(c.display_order + q.display_order, 4), 'A', 'B', 'C', 'D')
JOIN evaluation_values final_val ON final_val.code = CASE
    WHEN er.status LIKE 'REJECTED%' THEN 'D'
    WHEN er.final_percentage >= 90 THEN 'A'
    WHEN er.final_percentage >= 75 THEN 'B'
    WHEN er.final_percentage >= 60 THEN 'C'
    ELSE ELT(1 + MOD(c.display_order + q.display_order + 1, 4), 'A', 'B', 'C', 'D')
END
LEFT JOIN users evaluator ON evaluator.email = CASE
    WHEN MOD(er.id, 2) = 0 THEN 'evaluator.sara@demo.local'
    ELSE 'evaluator.omar@demo.local'
END
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_answers a
      WHERE a.request_id = er.id AND a.question_id = q.id
  );

INSERT INTO evaluation_attachments
    (request_id, category_id, required_doc_id, file_uuid, original_name, mime_type, size_bytes, storage_path, sha256, uploaded_by_user_id)
SELECT er.id, d.category_id, d.id, UUID(),
       CONCAT(er.request_number, '-', REPLACE(LOWER(d.label_en), ' ', '-'), '.pdf'),
       'application/pdf',
       180000 + (d.id * 4096),
       CONCAT('./uploads/demo/evaluations/', er.request_number, '/', d.id, '.pdf'),
       SHA2(CONCAT(er.request_number, ':required:', d.id), 256),
       er.submitted_by_user_id
FROM evaluation_requests er
JOIN evaluation_request_categories erc ON erc.request_id = er.id
JOIN category_required_documents d ON d.category_id = erc.category_id
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND er.status <> 'DRAFT'
  AND NOT EXISTS (
      SELECT 1 FROM evaluation_attachments a
      WHERE a.request_id = er.id AND a.required_doc_id = d.id
  );

INSERT INTO request_assignments (request_id, stage, assigned_user_id, assigned_by_user_id, is_auto, assigned_at, completed_at)
SELECT er.id, seed.stage, assigned.id, assigner.id, TRUE,
       DATE_SUB(NOW(), INTERVAL seed.assigned_days DAY),
       CASE WHEN seed.completed_days IS NULL THEN NULL ELSE DATE_SUB(NOW(), INTERVAL seed.completed_days DAY) END
FROM evaluation_requests er
JOIN (
    SELECT 'INITIAL_EVALUATION' AS stage, 'evaluator.sara@demo.local' AS assigned_email, 20 AS assigned_days, 16 AS completed_days
    UNION ALL SELECT 'ADMIN_REVIEW', 'admin.mona@demo.local', 15, 12
    UNION ALL SELECT 'FIELD_REVIEW', 'field.khaled@demo.local', 10, NULL
) seed
JOIN users assigned ON assigned.email = seed.assigned_email
JOIN users assigner ON assigner.email = 'admin.mona@demo.local'
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND er.status IN ('UNDER_EVALUATION','PENDING_ADMIN','APPROVED_ADMIN','PENDING_FIELD','APPROVED_FINAL','REJECTED_FINAL','COMPLETED')
  AND (
      seed.stage = 'INITIAL_EVALUATION'
      OR er.status IN ('PENDING_ADMIN','APPROVED_ADMIN','PENDING_FIELD','APPROVED_FINAL','REJECTED_FINAL','COMPLETED')
  )
  AND (
      seed.stage <> 'FIELD_REVIEW'
      OR er.status IN ('PENDING_FIELD','APPROVED_FINAL','REJECTED_FINAL','COMPLETED')
  )
  AND NOT EXISTS (
      SELECT 1 FROM request_assignments x
      WHERE x.request_id = er.id AND x.stage = seed.stage
  );

INSERT INTO workflow_decisions (request_id, stage, decision, notes, decided_by_user_id, decided_at)
SELECT er.id, seed.stage, seed.decision, seed.notes, reviewer.id,
       DATE_SUB(NOW(), INTERVAL seed.decided_days DAY)
FROM evaluation_requests er
JOIN (
    SELECT 'APPROVED_INITIAL' AS status_code, 'INITIAL_EVALUATION' AS stage, 'APPROVED' AS decision, 'Initial evidence is acceptable for administrative review.' AS notes, 'evaluator.sara@demo.local' AS reviewer_email, 18 AS decided_days
    UNION ALL SELECT 'REJECTED_INITIAL', 'INITIAL_EVALUATION', 'REJECTED', 'Initial evidence is incomplete and must be rebuilt.', 'evaluator.omar@demo.local', 20
    UNION ALL SELECT 'PENDING_ADMIN', 'INITIAL_EVALUATION', 'APPROVED', 'Initial evaluation passed; admin review pending.', 'evaluator.sara@demo.local', 12
    UNION ALL SELECT 'APPROVED_ADMIN', 'INITIAL_EVALUATION', 'APPROVED', 'Initial evaluation passed.', 'evaluator.sara@demo.local', 16
    UNION ALL SELECT 'APPROVED_ADMIN', 'ADMIN_REVIEW', 'APPROVED', 'Administrative documents are acceptable.', 'admin.mona@demo.local', 14
    UNION ALL SELECT 'REJECTED_ADMIN', 'INITIAL_EVALUATION', 'APPROVED', 'Initial evidence passed.', 'evaluator.omar@demo.local', 28
    UNION ALL SELECT 'REJECTED_ADMIN', 'ADMIN_REVIEW', 'REJECTED', 'Administrative authorization needs correction.', 'admin.mona@demo.local', 24
    UNION ALL SELECT 'PENDING_FIELD', 'INITIAL_EVALUATION', 'APPROVED', 'Initial review complete.', 'evaluator.sara@demo.local', 15
    UNION ALL SELECT 'PENDING_FIELD', 'ADMIN_REVIEW', 'APPROVED', 'Administrative review complete.', 'admin.mona@demo.local', 12
    UNION ALL SELECT 'APPROVED_FINAL', 'INITIAL_EVALUATION', 'APPROVED', 'Initial review complete.', 'evaluator.omar@demo.local', 24
    UNION ALL SELECT 'APPROVED_FINAL', 'ADMIN_REVIEW', 'APPROVED', 'Administrative review complete.', 'admin.mona@demo.local', 21
    UNION ALL SELECT 'APPROVED_FINAL', 'FIELD_REVIEW', 'APPROVED', 'Field evidence accepted.', 'field.khaled@demo.local', 18
    UNION ALL SELECT 'REJECTED_FINAL', 'INITIAL_EVALUATION', 'APPROVED', 'Initial review complete.', 'evaluator.sara@demo.local', 35
    UNION ALL SELECT 'REJECTED_FINAL', 'ADMIN_REVIEW', 'APPROVED', 'Administrative review complete.', 'admin.mona@demo.local', 32
    UNION ALL SELECT 'REJECTED_FINAL', 'FIELD_REVIEW', 'REJECTED', 'Field evidence does not confirm readiness.', 'field.khaled@demo.local', 29
    UNION ALL SELECT 'COMPLETED', 'INITIAL_EVALUATION', 'APPROVED', 'Initial review completed successfully.', 'evaluator.sara@demo.local', 36
    UNION ALL SELECT 'COMPLETED', 'ADMIN_REVIEW', 'APPROVED', 'Administrative review completed successfully.', 'admin.mona@demo.local', 33
    UNION ALL SELECT 'COMPLETED', 'FIELD_REVIEW', 'APPROVED', 'Field review completed successfully.', 'field.khaled@demo.local', 30
) seed ON seed.status_code = er.status
JOIN users reviewer ON reviewer.email = seed.reviewer_email
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND NOT EXISTS (
      SELECT 1 FROM workflow_decisions x
      WHERE x.request_id = er.id AND x.stage = seed.stage
  );

INSERT INTO final_reports
    (request_id, file_uuid, storage_path, language, generated_at, generated_by_user_id, sha256)
SELECT er.id, UUID(), CONCAT('./reports/demo/', er.request_number, '-final-report.pdf'),
       CASE WHEN MOD(er.id, 2) = 0 THEN 'en' ELSE 'ar' END,
       DATE_SUB(NOW(), INTERVAL 3 DAY), generator.id,
       SHA2(CONCAT(er.request_number, ':final-report'), 256)
FROM evaluation_requests er
JOIN users generator ON generator.email = 'admin.mona@demo.local'
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND er.status = 'COMPLETED'
  AND NOT EXISTS (SELECT 1 FROM final_reports fr WHERE fr.request_id = er.id);

INSERT INTO notifications
    (user_id, event_type, title_ar, title_en, message_ar, message_en, related_entity, related_id, link_url, is_read, sent_via_email, created_at)
SELECT er.submitted_by_user_id,
       CASE
           WHEN er.status = 'INFO_REQUESTED' THEN 'INFO_REQUESTED'
           WHEN er.status = 'COMPLETED' THEN 'REPORT_READY'
           ELSE 'REQUEST_STATUS_CHANGED'
       END,
       CASE
           WHEN er.status = 'INFO_REQUESTED' THEN 'مطلوب معلومات إضافية'
           WHEN er.status = 'COMPLETED' THEN 'التقرير النهائي جاهز'
           ELSE 'تم تحديث حالة الطلب'
       END,
       CASE
           WHEN er.status = 'INFO_REQUESTED' THEN 'Additional information requested'
           WHEN er.status = 'COMPLETED' THEN 'Final report is ready'
           ELSE 'Request status updated'
       END,
       CASE
           WHEN er.status = 'INFO_REQUESTED' THEN 'يرجى مراجعة الطلب وإضافة المعلومات المطلوبة.'
           WHEN er.status = 'COMPLETED' THEN 'تم إصدار التقرير النهائي ويمكنك مراجعته الآن.'
           ELSE 'تم تحديث حالة طلب التقييم الخاص بك.'
       END,
       CASE
           WHEN er.status = 'INFO_REQUESTED' THEN 'Please review the request and add the requested information.'
           WHEN er.status = 'COMPLETED' THEN 'The final report has been generated and is ready to review.'
           ELSE 'Your evaluation request status has been updated.'
       END,
       'evaluation_request', er.id, CONCAT('/my-requests/', er.id), FALSE, TRUE,
       DATE_SUB(NOW(), INTERVAL MOD(er.id, 9) DAY)
FROM evaluation_requests er
WHERE er.request_number BETWEEN 'REQ-2026-DEMO010' AND 'REQ-2026-DEMO031'
  AND er.status <> 'DRAFT'
  AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = er.submitted_by_user_id
        AND n.related_entity = 'evaluation_request'
        AND n.related_id = er.id
  );

INSERT INTO audit_log
    (user_id, user_email, action_type, entity_type, entity_id, description, before_value, after_value, ip_address, user_agent, success, created_at)
SELECT actor.id, actor.email, seed.action_type, 'evaluation_request', er.id, seed.description,
       JSON_OBJECT('status', seed.before_status),
       JSON_OBJECT('status', er.status),
       seed.ip_address,
       'Codex demo seed',
       TRUE,
       DATE_SUB(NOW(), INTERVAL seed.days_ago DAY)
FROM evaluation_requests er
JOIN (
    SELECT 'REQ-2026-DEMO010' AS request_number, 'REQUEST_SUBMITTED' AS action_type, 'DRAFT' AS before_status, 'Demo request submitted by institution manager.' AS description, 'manager.cairo@demo.local' AS actor_email, '10.0.0.10' AS ip_address, 2 AS days_ago
    UNION ALL SELECT 'REQ-2026-DEMO011', 'ASSIGNMENT_CREATED', 'PENDING_REVIEW', 'Demo request assigned to evaluator.', 'admin.mona@demo.local', '10.0.0.11', 8
    UNION ALL SELECT 'REQ-2026-DEMO013', 'REPORT_GENERATED', 'APPROVED_FINAL', 'Final demo report generated.', 'admin.mona@demo.local', '10.0.0.13', 3
    UNION ALL SELECT 'REQ-2026-DEMO014', 'INFO_REQUESTED', 'UNDER_EVALUATION', 'Evaluator requested clearer evidence.', 'evaluator.omar@demo.local', '10.0.0.14', 4
    UNION ALL SELECT 'REQ-2026-DEMO017', 'REPORT_GENERATED', 'APPROVED_FINAL', 'Final demo report generated.', 'admin.mona@demo.local', '10.0.0.17', 5
    UNION ALL SELECT 'REQ-2026-DEMO019', 'REQUEST_REJECTED', 'PENDING_REVIEW', 'Initial review rejected the request.', 'evaluator.omar@demo.local', '10.0.0.19', 20
    UNION ALL SELECT 'REQ-2026-DEMO023', 'REPORT_GENERATED', 'APPROVED_FINAL', 'Final demo report generated.', 'admin.mona@demo.local', '10.0.0.23', 3
    UNION ALL SELECT 'REQ-2026-DEMO025', 'REQUEST_REJECTED', 'PENDING_ADMIN', 'Administrative review rejected the request.', 'admin.mona@demo.local', '10.0.0.25', 24
    UNION ALL SELECT 'REQ-2026-DEMO027', 'REPORT_GENERATED', 'APPROVED_FINAL', 'Final demo report generated.', 'admin.mona@demo.local', '10.0.0.27', 3
    UNION ALL SELECT 'REQ-2026-DEMO029', 'REPORT_GENERATED', 'APPROVED_FINAL', 'Final demo report generated.', 'admin.mona@demo.local', '10.0.0.29', 3
) seed ON seed.request_number = er.request_number
JOIN users actor ON actor.email = seed.actor_email
WHERE NOT EXISTS (
    SELECT 1 FROM audit_log a
    WHERE a.entity_type = 'evaluation_request'
      AND a.entity_id = er.id
      AND a.action_type = seed.action_type
);
