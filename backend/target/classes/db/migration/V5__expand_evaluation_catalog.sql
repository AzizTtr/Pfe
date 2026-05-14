-- Expand the evaluation catalog to 15 practical categories with 5 clear questions each.

INSERT INTO evaluation_categories
    (code, name_ar, name_en, description_ar, description_en, display_order, is_active)
SELECT seed.code,
       seed.name_ar,
       seed.name_en,
       seed.description_ar,
       seed.description_en,
       seed.display_order,
       TRUE
FROM (
    SELECT 'STUDENT_SUPPORT' AS code, 'دعم المتعلمين' AS name_ar, 'Student support' AS name_en,
           'خدمات التوجيه والدعم والمتابعة المقدمة للمتعلمين.' AS description_ar,
           'Guidance, support, and follow-up services provided to learners.' AS description_en,
           5 AS display_order
    UNION ALL SELECT 'ADMINISTRATION', 'الإدارة والحوكمة', 'Administration and governance',
           'وضوح السياسات وتنظيم المسؤوليات والعمليات اليومية.',
           'Clear policies, responsibilities, and daily operations.',
           6
    UNION ALL SELECT 'QUALITY_ASSURANCE', 'ضمان الجودة', 'Quality assurance',
           'آليات التحسين المستمر ومتابعة مؤشرات الجودة.',
           'Continuous improvement practices and quality indicators.',
           7
    UNION ALL SELECT 'DIGITAL_LEARNING', 'التعلم الرقمي', 'Digital learning',
           'استخدام الأدوات والموارد الرقمية لدعم تعلم اللغة العربية.',
           'Use of digital tools and resources to support Arabic learning.',
           8
    UNION ALL SELECT 'LIBRARY_RESOURCES', 'المكتبة وموارد التعلم', 'Library and learning resources',
           'توفر الموارد التعليمية المناسبة وسهولة استخدامها.',
           'Availability and usability of suitable learning resources.',
           9
    UNION ALL SELECT 'STUDENT_ASSESSMENT', 'ممارسات تقييم المتعلمين', 'Student assessment practices',
           'اختبارات تحديد المستوى والتقييم أثناء الدورة وتحليل النتائج.',
           'Placement, course assessment, and analysis of learner results.',
           10
    UNION ALL SELECT 'COMMUNICATION', 'التواصل مع المتعلمين', 'Communication with learners',
           'وضوح القنوات والإعلانات والتواصل المهني مع المتعلمين.',
           'Clear channels, announcements, and professional communication with learners.',
           11
    UNION ALL SELECT 'INCLUSION', 'الشمول وإتاحة الوصول', 'Inclusion and accessibility',
           'عدالة الخدمات ومناسبتها لاختلاف احتياجات المتعلمين.',
           'Fair and accessible services for different learner needs.',
           12
    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 'التطوير المهني', 'Professional development',
           'تدريب العاملين وتبادل الخبرات ومتابعة أثر التدريب.',
           'Staff training, knowledge sharing, and follow-up on training impact.',
           13
    UNION ALL SELECT 'SAFETY_WELLBEING', 'السلامة والرفاه', 'Safety and wellbeing',
           'سلامة بيئة التعلم ورفاه المتعلمين والعاملين.',
           'Safety of the learning space and wellbeing of learners and staff.',
           14
    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 'الشراكات المجتمعية', 'Community partnership',
           'التعاون والأنشطة التي تربط التعلم بالمجتمع والثقافة.',
           'Partnerships and activities that connect learning with community and culture.',
           15
) seed
WHERE NOT EXISTS (
    SELECT 1
    FROM evaluation_categories c
    WHERE c.code = seed.code
);

INSERT INTO questions
    (category_id, text_ar, text_en, requires_attachment, display_order, is_active)
SELECT c.id,
       seed.text_ar,
       seed.text_en,
       FALSE,
       seed.display_order,
       TRUE
FROM (
    SELECT 'CURRICULUM' AS code, 3 AS display_order,
           'هل يغطي المنهج مهارات الاستماع والتحدث والقراءة والكتابة؟' AS text_ar,
           'Does the curriculum cover listening, speaking, reading, and writing?' AS text_en
    UNION ALL SELECT 'CURRICULUM', 4, 'هل توجد نواتج تعلم واضحة لكل مستوى؟', 'Are learning outcomes clearly written for each level?'
    UNION ALL SELECT 'CURRICULUM', 5, 'هل تتم مراجعة المنهج وتحديثه بشكل منتظم؟', 'Is the curriculum reviewed and updated regularly?'

    UNION ALL SELECT 'TEACHING_STAFF', 3, 'هل يستخدم المعلمون أساليب تفاعلية داخل الصف؟', 'Do teachers use interactive methods in class?'
    UNION ALL SELECT 'TEACHING_STAFF', 4, 'هل تتم متابعة أداء المعلمين وتقديم الدعم لهم؟', 'Is teacher performance observed and supported?'
    UNION ALL SELECT 'TEACHING_STAFF', 5, 'هل يقدم المعلمون تغذية راجعة واضحة للمتعلمين؟', 'Do teachers give learners clear feedback?'

    UNION ALL SELECT 'LEARNING_ENV', 3, 'هل القاعات نظيفة وآمنة ومناسبة للتعلم؟', 'Are classrooms clean, safe, and suitable for learning?'
    UNION ALL SELECT 'LEARNING_ENV', 4, 'هل عدد المتعلمين في الصف مناسب للتدريب اللغوي؟', 'Is class size suitable for language practice?'
    UNION ALL SELECT 'LEARNING_ENV', 5, 'هل يستطيع المتعلمون الوصول إلى المواد المطلوبة بسهولة؟', 'Are learners able to access needed materials easily?'

    UNION ALL SELECT 'ASSESSMENT', 3, 'هل تتوافق الاختبارات مع المحتوى الذي تم تدريسه؟', 'Are tests aligned with the taught content?'
    UNION ALL SELECT 'ASSESSMENT', 4, 'هل يتم شرح معايير التقييم للمتعلمين؟', 'Are assessment criteria explained to learners?'
    UNION ALL SELECT 'ASSESSMENT', 5, 'هل يتم تسجيل نتائج المتعلمين ومتابعتها مع الوقت؟', 'Are learner results recorded and followed over time?'

    UNION ALL SELECT 'STUDENT_SUPPORT', 1, 'هل يحصل المتعلمون على توجيه واضح عند الالتحاق بالبرنامج؟', 'Are learners guided when they join the program?'
    UNION ALL SELECT 'STUDENT_SUPPORT', 2, 'هل يتوفر دعم أكاديمي للمتعلمين الذين يحتاجون إلى مساعدة؟', 'Is academic support available for learners who need help?'
    UNION ALL SELECT 'STUDENT_SUPPORT', 3, 'هل يتم التعامل مع شكاوى المتعلمين بوضوح وعدل؟', 'Are learner complaints handled clearly and fairly?'
    UNION ALL SELECT 'STUDENT_SUPPORT', 4, 'هل تتم متابعة الحضور والمشاركة بانتظام؟', 'Are attendance and participation followed regularly?'
    UNION ALL SELECT 'STUDENT_SUPPORT', 5, 'هل يتم إبلاغ المتعلمين بتقدمهم الدراسي؟', 'Are learners informed about their progress?'

    UNION ALL SELECT 'ADMINISTRATION', 1, 'هل لدى المؤسسة سياسات وإجراءات واضحة؟', 'Does the institution have clear policies and procedures?'
    UNION ALL SELECT 'ADMINISTRATION', 2, 'هل أدوار ومسؤوليات العاملين محددة؟', 'Are staff roles and responsibilities defined?'
    UNION ALL SELECT 'ADMINISTRATION', 3, 'هل السجلات منظمة وسهلة الوصول؟', 'Are records organized and easy to access?'
    UNION ALL SELECT 'ADMINISTRATION', 4, 'هل يتم توثيق القرارات وإبلاغ المعنيين بها؟', 'Are decisions documented and communicated?'
    UNION ALL SELECT 'ADMINISTRATION', 5, 'هل توجد خطة لإدارة العمليات اليومية؟', 'Is there a plan for managing daily operations?'

    UNION ALL SELECT 'QUALITY_ASSURANCE', 1, 'هل توجد خطة واضحة لتحسين الجودة؟', 'Is there a clear quality improvement plan?'
    UNION ALL SELECT 'QUALITY_ASSURANCE', 2, 'هل يتم جمع آراء المتعلمين والمعلمين؟', 'Are learner and teacher opinions collected?'
    UNION ALL SELECT 'QUALITY_ASSURANCE', 3, 'هل تتم مراجعة المشكلات ومعالجتها؟', 'Are problems reviewed and corrected?'
    UNION ALL SELECT 'QUALITY_ASSURANCE', 4, 'هل تتم مناقشة نتائج الجودة مع العاملين؟', 'Are quality results discussed with staff?'
    UNION ALL SELECT 'QUALITY_ASSURANCE', 5, 'هل تتم متابعة التقدم وفق مؤشرات واضحة؟', 'Is progress checked against clear indicators?'

    UNION ALL SELECT 'DIGITAL_LEARNING', 1, 'هل تستخدم أدوات رقمية لدعم التعلم؟', 'Are digital tools used to support learning?'
    UNION ALL SELECT 'DIGITAL_LEARNING', 2, 'هل يستطيع المتعلمون الوصول إلى المواد الإلكترونية بسهولة؟', 'Can learners access online materials easily?'
    UNION ALL SELECT 'DIGITAL_LEARNING', 3, 'هل تم تدريب المعلمين على استخدام الأدوات الرقمية؟', 'Are teachers trained to use digital tools?'
    UNION ALL SELECT 'DIGITAL_LEARNING', 4, 'هل المحتوى الإلكتروني منظم بوضوح؟', 'Is online learning content organized clearly?'
    UNION ALL SELECT 'DIGITAL_LEARNING', 5, 'هل يتوفر دعم تقني عند الحاجة؟', 'Is technical support available when needed?'

    UNION ALL SELECT 'LIBRARY_RESOURCES', 1, 'هل تتوفر كتب لتعلم العربية للمتعلمين؟', 'Are Arabic learning books available for learners?'
    UNION ALL SELECT 'LIBRARY_RESOURCES', 2, 'هل تتوفر موارد صوتية ومرئية؟', 'Are audio and visual resources available?'
    UNION ALL SELECT 'LIBRARY_RESOURCES', 3, 'هل الموارد مناسبة للمستويات المختلفة؟', 'Are resources suitable for different levels?'
    UNION ALL SELECT 'LIBRARY_RESOURCES', 4, 'هل يستطيع المتعلمون استعارة الموارد أو استخدامها بسهولة؟', 'Can learners borrow or use resources easily?'
    UNION ALL SELECT 'LIBRARY_RESOURCES', 5, 'هل تتم مراجعة الموارد وتحديثها؟', 'Are resources reviewed and updated?'

    UNION ALL SELECT 'STUDENT_ASSESSMENT', 1, 'هل تستخدم اختبارات تحديد المستوى قبل بدء الدراسة؟', 'Are placement tests used before starting classes?'
    UNION ALL SELECT 'STUDENT_ASSESSMENT', 2, 'هل يتم تقييم المتعلمين أثناء الدورة؟', 'Are learners assessed during the course?'
    UNION ALL SELECT 'STUDENT_ASSESSMENT', 3, 'هل تعرض النتائج النهائية للمتعلمين بوضوح؟', 'Are final results shared clearly with learners?'
    UNION ALL SELECT 'STUDENT_ASSESSMENT', 4, 'هل تستخدم طرق تقييم متنوعة؟', 'Are different assessment methods used?'
    UNION ALL SELECT 'STUDENT_ASSESSMENT', 5, 'هل يتم تحديد نقاط الضعف من نتائج التقييم؟', 'Are weak areas identified from assessment results?'

    UNION ALL SELECT 'COMMUNICATION', 1, 'هل تصل الإعلانات إلى المتعلمين في الوقت المناسب؟', 'Are announcements shared with learners on time?'
    UNION ALL SELECT 'COMMUNICATION', 2, 'هل توجد قناة واضحة لأسئلة المتعلمين؟', 'Is there a clear channel for learner questions?'
    UNION ALL SELECT 'COMMUNICATION', 3, 'هل يتم إبلاغ الجداول والتغييرات بوضوح؟', 'Are schedules and changes communicated clearly?'
    UNION ALL SELECT 'COMMUNICATION', 4, 'هل يتم إبلاغ أولياء الأمور أو الجهات الداعمة عند الحاجة؟', 'Are parents or sponsors informed when relevant?'
    UNION ALL SELECT 'COMMUNICATION', 5, 'هل التواصل مهذب ومهني؟', 'Is communication polite and professional?'

    UNION ALL SELECT 'INCLUSION', 1, 'هل تتوفر خدمات للمتعلمين ذوي الاحتياجات الخاصة؟', 'Are services available for learners with special needs?'
    UNION ALL SELECT 'INCLUSION', 2, 'هل المواد التعليمية واضحة وسهلة الاستخدام؟', 'Are learning materials clear and easy to use?'
    UNION ALL SELECT 'INCLUSION', 3, 'هل يعامل المتعلمون بالتساوي داخل الصف؟', 'Are learners treated equally in class?'
    UNION ALL SELECT 'INCLUSION', 4, 'هل يتوفر دعم لاختلاف سرعات التعلم؟', 'Is support available for different learning speeds?'
    UNION ALL SELECT 'INCLUSION', 5, 'هل المرافق مناسبة لوصول جميع المتعلمين؟', 'Are facilities accessible to all learners?'

    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 1, 'هل يحصل العاملون على فرص تدريب منتظمة؟', 'Do staff receive regular training opportunities?'
    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 2, 'هل يتم تحديد الاحتياجات التدريبية كل سنة؟', 'Are training needs identified each year?'
    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 3, 'هل يتبادل المعلمون الممارسات الجيدة فيما بينهم؟', 'Do teachers share good practices with each other?'
    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 4, 'هل تتم متابعة أثر التدريب بعد انتهائه؟', 'Is training impact followed after completion?'
    UNION ALL SELECT 'PROFESSIONAL_DEVELOPMENT', 5, 'هل يحصل العاملون الجدد على دعم عند بداية العمل؟', 'Are new staff supported during onboarding?'

    UNION ALL SELECT 'SAFETY_WELLBEING', 1, 'هل بيئة التعلم آمنة للمتعلمين والعاملين؟', 'Is the learning space safe for learners and staff?'
    UNION ALL SELECT 'SAFETY_WELLBEING', 2, 'هل يعرف العاملون إجراءات الطوارئ؟', 'Are emergency procedures known to staff?'
    UNION ALL SELECT 'SAFETY_WELLBEING', 3, 'هل تتم متابعة رفاه المتعلمين؟', 'Is learner wellbeing monitored?'
    UNION ALL SELECT 'SAFETY_WELLBEING', 4, 'هل تطبق قواعد الصحة والسلامة الأساسية؟', 'Are basic health and safety rules applied?'
    UNION ALL SELECT 'SAFETY_WELLBEING', 5, 'هل يتم تشجيع السلوك المحترم داخل المؤسسة؟', 'Is respectful behavior encouraged in the institution?'

    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 1, 'هل تتعاون المؤسسة مع شركاء مفيدين؟', 'Does the institution cooperate with useful partners?'
    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 2, 'هل تنظم أنشطة ثقافية للمتعلمين؟', 'Are cultural activities organized for learners?'
    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 3, 'هل يتم ربط المتعلمين بمواقف حقيقية لاستخدام اللغة؟', 'Are learners connected with real language-use situations?'
    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 4, 'هل تتم مراجعة نتائج الشراكات؟', 'Are partnership results reviewed?'
    UNION ALL SELECT 'COMMUNITY_PARTNERSHIP', 5, 'هل تدعم الأنشطة اللغة العربية والثقافة؟', 'Do activities support Arabic language and culture?'
) seed
JOIN evaluation_categories c ON c.code = seed.code
WHERE NOT EXISTS (
    SELECT 1
    FROM questions q
    WHERE q.category_id = c.id
      AND q.display_order = seed.display_order
);
