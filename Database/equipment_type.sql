-- ==============================================================================
-- TecnoFix - Script SQL para Neon (PostgreSQL)
-- Requerimiento: ADM-001 (Gestionar catálogo de tipos de equipo)
-- Estándar: Tablas en PascalCase singular, columnas en snake_case, PK como <tabla>_id
-- ==============================================================================

-- 1. Creación de la tabla EquipmentType
CREATE TABLE IF NOT EXISTS "EquipmentType" (
    equipment_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Índices para optimizar búsquedas por nombre y estado habilitado
CREATE INDEX IF NOT EXISTS idx_equipment_type_name_lower ON "EquipmentType" (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_equipment_type_enabled ON "EquipmentType" (enabled);

-- 3. Datos iniciales de prueba (ejemplos mencionados en la ERS)
INSERT INTO "EquipmentType" (name, description, enabled)
VALUES 
    ('Notebook', 'Equipos portátiles de cómputo y laptops', TRUE),
    ('Impresora', 'Impresoras multifuncionales, térmicas y de inyección', TRUE),
    ('Teléfono', 'Smartphones y teléfonos móviles corporativos', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Nota sobre la relación con órdenes de reparación (ORD-001):
-- La tabla de órdenes referencia a "EquipmentType" mediante la FK equipment_type_id.
-- No se permite eliminación física (ON DELETE RESTRICT o sin CASCADE).
-- Ejemplo referencial:
-- ALTER TABLE "RepairOrder" ADD CONSTRAINT fk_order_equipment_type 
-- FOREIGN KEY (equipment_type_id) REFERENCES "EquipmentType"(equipment_type_id) ON DELETE RESTRICT;
