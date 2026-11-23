-- Garante a extensão PostGIS na inicialização do container PostgreSQL.
-- Os índices espaciais GiST da tabela `routes` são criados de forma idempotente
-- pelo componente Spring `SpatialIndexInitializer` (ApplicationReadyEvent),
-- após o Hibernate criar/atualizar o schema.
CREATE EXTENSION IF NOT EXISTS postgis;
