-- TecnoFix: datos iniciales del catálogo de tipos de equipo (ADM-001).
-- Requiere la fase 1 (2026-10-27_new_schema.sql). Se puede repetir sin riesgo:
-- los nombres que ya existen no se duplican.

INSERT INTO equipment_types (name, description, enabled)
VALUES
  ('Notebook',  'Equipos portátiles de cómputo y laptops',              true),
  ('Impresora', 'Impresoras multifuncionales, térmicas y de inyección', true),
  ('Teléfono',  'Smartphones y teléfonos móviles corporativos',         true)
ON CONFLICT (name) DO NOTHING;
