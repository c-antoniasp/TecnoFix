-- TecnoFix: FASE 2 de 3. Copia a "users" los usuarios que se crearon en las tablas antiguas
-- después de la fase 1 (por ejemplo, registros hechos con el backend anterior mientras se
-- desplegaba el nuevo). No duplica: omite los correos que ya existen. Se puede repetir.

BEGIN;

INSERT INTO users (role, full_name, email, password, rut, phone, specialty, account_status)
SELECT u.role, u.name, u.email, u.password, c.rut, c.phone, t.technician_type, COALESCE(t.enabled, true)
FROM "User" u
LEFT JOIN "Client" c     ON c.user_id = u.user_id
LEFT JOIN "Technician" t ON t.user_id = u.user_id
WHERE NOT EXISTS (SELECT 1 FROM users n WHERE lower(n.email) = lower(u.email))
ORDER BY u.user_id;

-- Verificación: todos los usuarios antiguos existen ahora en "users".
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "User" u WHERE NOT EXISTS (SELECT 1 FROM users n WHERE lower(n.email) = lower(u.email))) THEN
    RAISE EXCEPTION 'Quedan usuarios antiguos sin copiar; sincronización cancelada';
  END IF;
END $$;

COMMIT;
