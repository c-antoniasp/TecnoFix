# Cambio de contrasena (USU-004)

Esta entrega implementa el cambio de contrasena en el backend. Utiliza la sesion
del login del equipo; el login, sus pantallas y el modelo completo de usuarios
siguen siendo componentes de integracion del proyecto.

## Contrato

`PUT /api/auth/change-password`

La peticion debe incluir la cookie `access_token` del login o un encabezado
`Authorization: Bearer <token>`. El id se obtiene de la identidad validada por
JWT, no del cuerpo ni de la URL. Administrador, tecnico y cliente pueden cambiar
su propia contrasena.

```json
{
  "currentPassword": "Actual123",
  "newPassword": "Nueva1234",
  "confirmPassword": "Nueva1234"
}
```

Al guardar, se elimina la cookie `access_token` con el mismo nombre y ruta que
utiliza el login del equipo. La respuesta incluye `requiresLogin: true`.
El frontend debe limpiar su estado de usuario y mostrar el login al recibirla.
Si utiliza Bearer en vez de cookie, tambien debe borrar el token almacenado.
Eliminar la cookie no equivale a revocar todos los JWT emitidos anteriormente.

Los errores de validacion devuelven HTTP 400 y un JSON con `message`, manteniendo
los textos de USU-004. Una sesion inexistente o invalida devuelve 401. Un cambio
concurrente de contrasena devuelve 409 sin sobrescribir la nueva contrasena.

## Persistencia

El repositorio lee exclusivamente `password` de la tabla `"User"`, con clave
`user_id`, segun el estandar. Actualiza solo esa columna, utilizando parametros
de EF Core. La actualizacion compara tambien el hash anterior para evitar que
dos solicitudes sobrescriban sus cambios.

Las contrasenas registradas deben ser hashes BCrypt. No se aceptan valores
almacenados en texto plano. No se crean tablas ni migraciones.

## Integracion con el login

Se utiliza el mismo `UserSecretsId` que el proyecto de login del equipo.
`Jwt:Key`, `Jwt:Issuer` y `Jwt:Audience` deben coincidir con los del login;
`ConnectionStrings:DefaultConnection` debe apuntar a la base Neon del proyecto.
Los secretos se configuran fuera del repositorio. Sin una clave valida, ninguna
sesion puede acceder al endpoint.

Al integrar las ramas, conservar los metodos `login` y `logout` del equipo junto
con `changePassword`, tanto en `AuthController` como en `AuthService` y sus
interfaces. Incorporar los metodos del repositorio de esta entrega sin quitar
los metodos usados por el login. Conservar una sola definicion de `AuthException`;
esta entrega utiliza su contrato `statusCode` y `Message`.

## Pruebas

Desde `Backend`:

```powershell
dotnet test .\BackTecnoFix.Tests\BackTecnoFix.Tests.csproj
```

Las pruebas validan las reglas de contrasena, autenticacion JWT, los tres roles,
el usuario de la sesion, el borrado de la cookie y errores HTTP. Las consultas
del repositorio se comprueban en SQLite en memoria con una tabla de prueba
independiente; no se conecta a Neon ni se modifica ningun usuario real.

`BackTecnoFix/TecnoFixBack.http` contiene peticiones manuales. Requieren el login
integrado, los secretos configurados y un usuario de prueba registrado en Neon.
