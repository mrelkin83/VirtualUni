-- Unifica la escala de los exámenes con la del resto del sistema.
--
-- CAUSA: el servicio calificaba los exámenes sobre 10 --(puntos obtenidos /
-- puntaje total) * 10-- mientras que las notas del expediente y las entregas de
-- tareas van de 0 a 100. Era el único punto del sistema con otra escala.
--
-- CONSECUENCIA: un examen perfecto se guardaba como 10 y se mostraba junto a
-- notas de 0 a 100, donde 10 se lee como un suspenso rotundo. La nota mínima
-- por defecto (6) tampoco encajaba: quien la interpretara sobre 100 daba por
-- aprobado casi cualquier intento.
--
-- Se reescala lo ya existente para que el histórico siga siendo comparable.
ALTER TABLE "exams" ALTER COLUMN "nota_minima" SET DEFAULT 60;

UPDATE "exams" SET "nota_minima" = "nota_minima" * 10 WHERE "nota_minima" <= 10;

UPDATE "exam_attempts" SET "calificacion" = "calificacion" * 10
WHERE "calificacion" IS NOT NULL AND "calificacion" <= 10;
