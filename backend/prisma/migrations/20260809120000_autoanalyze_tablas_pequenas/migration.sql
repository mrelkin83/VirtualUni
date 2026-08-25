-- Baja el umbral de autoanalyze en todas las tablas del esquema public.
--
-- CAUSA: el umbral por defecto de PostgreSQL es 50 cambios + 10% de las filas.
-- Las tablas pequeñas de este proyecto (courses: 13 filas, assignments: 44) se
-- siembran de una vez y nunca vuelven a acumular 50 cambios, así que autovacuum
-- jamás las analiza: quedan con reltuples = -1 y sin una sola fila en pg_stats.
--
-- CONSECUENCIA: el planificador estima a ciegas sobre las tablas que dirigen los
-- joins. Medido con EXPLAIN ANALYZE sobre un panel de curso + matrículas +
-- tareas + notas, estimaba 3 filas donde salían 32.088 (error de 10.700x), lo
-- que le hace elegir nested loops y órdenes de join equivocados.
--
-- Con umbral 5 + 5%, una tabla de 13 filas se reanaliza tras ~6 cambios.
-- El coste es despreciable: son tablas de decenas a cientos de filas.
--
-- LIMITACIÓN CONOCIDA: esto se aplica a las tablas existentes al migrar. Las
-- tablas que creen migraciones futuras heredarán el umbral por defecto; si
-- vuelve a aparecer el síntoma, repetir este bloque.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I SET (autovacuum_analyze_threshold = 5, autovacuum_analyze_scale_factor = 0.05)',
      t.relname
    );
  END LOOP;
END $$;

-- Deja las estadísticas ya recolectadas, sin esperar al primer autoanalyze.
ANALYZE;
