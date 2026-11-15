-- TecnoFix: FASE 3 de 3. Elimina las tablas antiguas. NO TIENE VUELTA ATRÁS.
-- Ejecutar solo cuando el backend nuevo esté desplegado y verificado (login, registro de
-- clientes y de técnicos, cambio de contraseña) y después de la fase 2.
-- Respaldo: la rama de Neon "pre-migration-backup" conserva el estado anterior a la migración.

BEGIN;

-- Verificación 1: las tablas de órdenes antiguas no tienen datos que perder.
DO $$
BEGIN
  IF (SELECT count(*) FROM "RepairOrder") + (SELECT count(*) FROM "Diagnosis")
     + (SELECT count(*) FROM "OrderLog") > 0 THEN
    RAISE EXCEPTION 'Las tablas antiguas de órdenes tienen datos; eliminación cancelada';
  END IF;
END $$;

-- Verificación 2: todos los usuarios antiguos están en "users".
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "User" u WHERE NOT EXISTS (SELECT 1 FROM users n WHERE lower(n.email) = lower(u.email))) THEN
    RAISE EXCEPTION 'Hay usuarios antiguos sin copiar a users (ejecute la fase 2); eliminación cancelada';
  END IF;
END $$;

DROP TABLE "OrderLog", "Diagnosis", "RepairOrder", "Technician", "Client", "Administrator", "User";

COMMIT;
