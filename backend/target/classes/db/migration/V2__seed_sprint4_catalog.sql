-- Starter catalog for Sprint 4 request submission.
-- Safe to run on existing databases: every insert is guarded by natural codes/labels.

INSERT INTO evaluation_categories
    (code, name_ar, name_en, description_ar, description_en, display_order, is_active)
SELECT 'CURRICULUM', 'المناهج والبرامج', 'Curriculum and programs',
       'جودة المناهج والبرامج التعليمية', 'Quality of curricula and educational programs',
       1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM evaluation_categories WHERE code = 'CURRICULUM');

INSERT INTO evaluation_categories
    (code, name_ar, name_en, description_ar, description_en, display_order, is_active)
SELECT 'TEACHING_STAFF', 'الكادر التعليمي', 'Teaching staff',
       'كفاءة وتأهيل الكادر التعليمي', 'Teacher qualification and instructional capacity',
       2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM evaluation_categories WHERE code = 'TEACHING_STAFF');

INSERT INTO evaluation_categories
    (code, name_ar, name_en, description_ar, description_en, display_order, is_active)
SELECT 'LEARNING_ENV', 'البيئة التعليمية', 'Learning environment',
       'جودة البيئة الصفية والتقنية', 'Classroom, technical, and learner support environment',
       3, TRUE
WHERE NOT EXISTS (SELECT 1 FROM evaluation_categories WHERE code = 'LEARNING_ENV');

INSERT INTO evaluation_categories
    (code, name_ar, name_en, description_ar, description_en, display_order, is_active)
SELECT 'ASSESSMENT', 'التقويم والمتابعة', 'Assessment and follow-up',
       'آليات التقويم والمتابعة والتحسين', 'Assessment, follow-up, and improvement mechanisms',
       4, TRUE
WHERE NOT EXISTS (SELECT 1 FROM evaluation_categories WHERE code = 'ASSESSMENT');

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل توجد خطة منهجية واضحة لتعليم العربية للناطقين بغيرها؟',
       'Is there a clear curriculum plan for teaching Arabic to non-native speakers?',
       FALSE, 1, TRUE
FROM evaluation_categories c
WHERE c.code = 'CURRICULUM'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 1);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل تتدرج المواد التعليمية حسب مستويات المتعلمين؟',
       'Are learning materials sequenced according to learner levels?',
       FALSE, 2, TRUE
FROM evaluation_categories c
WHERE c.code = 'CURRICULUM'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 2);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل يمتلك المعلمون مؤهلات مناسبة في تعليم العربية للناطقين بغيرها؟',
       'Do teachers have suitable qualifications for teaching Arabic to non-native speakers?',
       FALSE, 1, TRUE
FROM evaluation_categories c
WHERE c.code = 'TEACHING_STAFF'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 1);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل توجد برامج تدريب مهني مستمرة للمعلمين؟',
       'Are continuous professional development programs available for teachers?',
       FALSE, 2, TRUE
FROM evaluation_categories c
WHERE c.code = 'TEACHING_STAFF'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 2);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل توفر القاعات والتقنيات بيئة مناسبة لتعلم اللغة؟',
       'Do classrooms and technologies provide a suitable language-learning environment?',
       FALSE, 1, TRUE
FROM evaluation_categories c
WHERE c.code = 'LEARNING_ENV'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 1);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل توجد موارد تعليمية مساندة للمتعلمين؟',
       'Are supporting learning resources available for students?',
       FALSE, 2, TRUE
FROM evaluation_categories c
WHERE c.code = 'LEARNING_ENV'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 2);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل توجد آلية واضحة لقياس تقدم المتعلمين؟',
       'Is there a clear mechanism for measuring learner progress?',
       FALSE, 1, TRUE
FROM evaluation_categories c
WHERE c.code = 'ASSESSMENT'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 1);

INSERT INTO questions (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id, 'هل تستخدم نتائج التقويم لتحسين البرنامج؟',
       'Are assessment results used to improve the program?',
       FALSE, 2, TRUE
FROM evaluation_categories c
WHERE c.code = 'ASSESSMENT'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.category_id = c.id AND q.display_order = 2);

INSERT INTO category_required_documents (category_id, label_ar, label_en, is_mandatory, display_order)
SELECT c.id, 'خطة المنهج أو توصيف البرنامج', 'Curriculum plan or program specification', TRUE, 1
FROM evaluation_categories c
WHERE c.code = 'CURRICULUM'
  AND NOT EXISTS (SELECT 1 FROM category_required_documents d WHERE d.category_id = c.id AND d.label_en = 'Curriculum plan or program specification');

INSERT INTO category_required_documents (category_id, label_ar, label_en, is_mandatory, display_order)
SELECT c.id, 'نماذج من المواد التعليمية', 'Samples of teaching materials', FALSE, 2
FROM evaluation_categories c
WHERE c.code = 'CURRICULUM'
  AND NOT EXISTS (SELECT 1 FROM category_required_documents d WHERE d.category_id = c.id AND d.label_en = 'Samples of teaching materials');

INSERT INTO category_required_documents (category_id, label_ar, label_en, is_mandatory, display_order)
SELECT c.id, 'السير الذاتية أو مؤهلات المعلمين', 'Teacher CVs or qualification records', TRUE, 1
FROM evaluation_categories c
WHERE c.code = 'TEACHING_STAFF'
  AND NOT EXISTS (SELECT 1 FROM category_required_documents d WHERE d.category_id = c.id AND d.label_en = 'Teacher CVs or qualification records');

INSERT INTO category_required_documents (category_id, label_ar, label_en, is_mandatory, display_order)
SELECT c.id, 'صور أو وصف البيئة التعليمية', 'Learning environment photos or description', FALSE, 1
FROM evaluation_categories c
WHERE c.code = 'LEARNING_ENV'
  AND NOT EXISTS (SELECT 1 FROM category_required_documents d WHERE d.category_id = c.id AND d.label_en = 'Learning environment photos or description');

INSERT INTO category_required_documents (category_id, label_ar, label_en, is_mandatory, display_order)
SELECT c.id, 'نماذج الاختبارات أو أدوات التقويم', 'Assessment samples or evaluation tools', TRUE, 1
FROM evaluation_categories c
WHERE c.code = 'ASSESSMENT'
  AND NOT EXISTS (SELECT 1 FROM category_required_documents d WHERE d.category_id = c.id AND d.label_en = 'Assessment samples or evaluation tools');
