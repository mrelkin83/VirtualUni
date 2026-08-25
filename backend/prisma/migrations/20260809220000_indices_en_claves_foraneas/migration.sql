-- Índices en las claves foráneas que no los tenían.
--
-- CAUSA: PostgreSQL no crea índices en las columnas de clave foránea, y Prisma
-- solo los genera cuando hay un @@index o una restricción única declarada. 21
-- claves foráneas del esquema se quedaron sin índice.
--
-- CONSECUENCIA: cada consulta que filtra o une por esas columnas recorre la
-- tabla entera. Medido con EXPLAIN ANALYZE sobre los datos actuales: pedir las
-- notas de un estudiante hacía un Seq Scan sobre grades descartando 588 filas
-- para devolver 40, y sus entregas descartaban 322 para devolver 25. Con
-- decenas de miles de filas eso deja de ser barato, y además cada borrado en
-- cascada tiene que comprobar las tablas hijas del mismo modo.
--
-- Se usa IF NOT EXISTS para que sea seguro reejecutarla.
CREATE INDEX IF NOT EXISTS "assignments_course_id_idx" ON "assignments"("course_id");
CREATE INDEX IF NOT EXISTS "book_loans_book_id_idx" ON "book_loans"("book_id");
CREATE INDEX IF NOT EXISTS "book_reservations_book_id_idx" ON "book_reservations"("book_id");
CREATE INDEX IF NOT EXISTS "card_issuances_template_id_idx" ON "card_issuances"("template_id");
CREATE INDEX IF NOT EXISTS "community_comments_autor_id_idx" ON "community_comments"("autor_id");
CREATE INDEX IF NOT EXISTS "community_likes_user_id_idx" ON "community_likes"("user_id");
CREATE INDEX IF NOT EXISTS "community_posts_autor_id_idx" ON "community_posts"("autor_id");
CREATE INDEX IF NOT EXISTS "course_topics_course_id_idx" ON "course_topics"("course_id");
CREATE INDEX IF NOT EXISTS "courses_teacher_id_idx" ON "courses"("teacher_id");
CREATE INDEX IF NOT EXISTS "enrollments_course_id_idx" ON "enrollments"("course_id");
CREATE INDEX IF NOT EXISTS "forum_replies_autor_id_idx" ON "forum_replies"("autor_id");
CREATE INDEX IF NOT EXISTS "forum_topics_autor_id_idx" ON "forum_topics"("autor_id");
CREATE INDEX IF NOT EXISTS "grades_course_id_idx" ON "grades"("course_id");
CREATE INDEX IF NOT EXISTS "grades_student_id_idx" ON "grades"("student_id");
CREATE INDEX IF NOT EXISTS "grades_teacher_id_idx" ON "grades"("teacher_id");
CREATE INDEX IF NOT EXISTS "group_members_student_id_idx" ON "group_members"("student_id");
CREATE INDEX IF NOT EXISTS "invoices_tenant_id_idx" ON "invoices"("tenant_id");
CREATE INDEX IF NOT EXISTS "materials_folder_id_idx" ON "materials"("folder_id");
CREATE INDEX IF NOT EXISTS "submissions_student_id_idx" ON "submissions"("student_id");
CREATE INDEX IF NOT EXISTS "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");
CREATE INDEX IF NOT EXISTS "topic_blocks_topic_id_idx" ON "topic_blocks"("topic_id");

-- Sin estadísticas frescas el planificador seguiría ignorando los índices
-- recién creados en las tablas que aún no se hubieran analizado.
ANALYZE;
