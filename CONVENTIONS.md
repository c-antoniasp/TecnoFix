# Convenciones de TecnoFix

Resumen del **Estándar de Programación de TecnoFix (Codexia)**. Reúne las reglas que el equipo aplica al escribir código, al conectar las capas del sistema y al trabajar con Git y GitHub.

---

## 1. Programación

- **Backend:** arquitectura por capas: `Controller → Services → Repositories → Data`.
- **Frontend:** React basado en componentes. Cada pantalla es un componente en `src/components` y `App.jsx` coordina la sesión y las llamadas a la API.
- **Idiomas:**
  - Código fuente (clases, variables, funciones, tablas, columnas): **inglés**.
  - Documentación y comentarios del código: **español**.
  - Mensajes de commit y títulos de pull request: **inglés**.
  - Mensajes para el usuario final: **español**, copiados literalmente de la ERS.

### Notación

| Elemento | Notación | Ejemplo |
|---|---|---|
| Variables, funciones y métodos | camelCase | `findByEmail`, `handleLogin` |
| Propiedades de modelos y DTO | camelCase | `userId`, `technicianType` |
| Clases y archivos de clase | PascalCase | `AuthService.cs`, `UserRepository.cs` |
| Interfaces | PascalCase con prefijo `I` | `IAuthService`, `IUserRepository` |
| DTO | PascalCase con sufijo `DTO` | `LoginRequestDTO`, `LoginResponseDTO` |
| Carpetas del backend | PascalCase | `Services`, `Repositories`, `Data` |
| Componentes React | PascalCase (`.tsx`) | `TecnoFixLogin.tsx` |
| Constantes del frontend | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_KEY` |

---

## 2. Estructura del proyecto

```text
TecnoFix/
├── Backend/BackTecnoFix/   API en ASP.NET Core (.NET 10)
├── Frontend/mi-login/      Aplicación React + Vite
├── .gitignore
└── README.md
```

### 2.1 Backend

| Carpeta | Responsabilidad |
|---|---|
| `Controller` | Recibe la petición HTTP, llama al servicio y devuelve la respuesta. Sin reglas de negocio ni consultas. |
| `Services` | Reglas de negocio y validaciones. Lanza errores de negocio con su código HTTP. |
| `Repositories` | Único lugar que consulta la base de datos, a través del `DbContext`. |
| `Data` | Contexto de EF Core y mapeo de tablas y columnas. |
| `Models` | Entidades que representan las tablas y los enums. |
| `DTO` | Objetos de entrada y salida de la API. Nunca se expone una entidad directamente. |

**Regla de dependencia:** cada capa solo habla con la capa inmediatamente inferior. Un Controller nunca usa el `DbContext` y un Repository nunca conoce a un Controller.

Ejemplo (login): `POST /api/auth/login` → `AuthController.login` → `AuthService.login` (valida y verifica con BCrypt) → `UserRepository.findByEmail` → `AppDbContext` → Neon.

### 2.2 Frontend

- Los componentes **no llaman a la API**: reciben datos y funciones por props (`onSubmit`, `error`, `orders`, `onLogout`).
- `App.jsx` hace las llamadas, guarda la sesión y decide qué pantalla mostrar según el rol.
- Los componentes se escriben en TypeScript (`.tsx`) y exportan sus tipos cuando otras partes los necesitan.

### 2.3 Paleta de colores

La paleta puede cambiar. Si cambia, se actualiza este apartado y `TecnoFixDashboard.tsx` en el mismo pull request.

**Principales**

| Nombre | Código | Uso |
|---|---|---|
| Slate oscuro | `#0F172A` | Texto principal, títulos, encabezados de tabla, tarjeta de usuario |
| Verde esmeralda | `#10B981` | Color de marca: barras, indicadores, botón de entrega |
| Verde oscuro | `#065F46` | Botones primarios, ítem activo del menú, tarjeta destacada |
| Verde profundo | `#064E3B` | Fondo de la tarjeta destacada (degradado hacia slate oscuro) |
| Verde intenso | `#047857` | Textos destacados en verde, avatar |
| Celeste | `#0EA5E9` | Acento: degradado del logo |

**Neutros**

| Nombre | Código | Uso |
|---|---|---|
| Blanco | `#FFFFFF` | Tarjetas, paneles y menú lateral |
| Gris muy claro | `#F1F5F9` | Fondo del contenido y de las tarjetas de datos |
| Gris claro | `#E2E8F0` | Bordes y separadores |
| Gris suave | `#94A3B8` | Texto de apoyo y encabezados de tabla |
| Gris azulado | `#64748B` | Texto secundario |

**Error (obligatorio, NF01):** `#F56558` en todos los mensajes de error. No se reemplaza por otro rojo.

**Estados de la orden**

| Estado | Fondo | Texto | Punto |
|---|---|---|---|
| Recibida | `#E2E8F0` | `#334155` | `#64748B` |
| En diagnóstico | `#FEF3C7` | `#92400E` | `#F59E0B` |
| Presupuestada | `#DBEAFE` | `#1D4ED8` | `#3B82F6` |
| En reparación | `#EDE9FE` | `#6D28D9` | `#8B5CF6` |
| Lista para retiro | `#D1FAE5` | `#065F46` | `#10B981` |
| Entregada | `#DCFCE7` | `#166534` | `#22C55E` |
| Rechazada | `#FEE2E2` | `#991B1B` | `#EF4444` |

**Reglas de uso**

- Los colores de estado solo indican el estado de una orden, no decoran.
- Verde para acciones y estados positivos; rojo para errores y estados rechazados.
- Antes de agregar un color nuevo, revisa si alguno de la paleta sirve. Si no, agrégalo aquí con su uso.

---

## 3. Base de datos

- PostgreSQL en **Neon**, desarrollada en **inglés**.
- Columnas en **snake_case**.
- Los enums se definen en la base (por ejemplo `user_role`: `ADMIN`, `TECHNICIAN`, `CLIENT`).
- Contraseñas siempre como hash **BCrypt** (columna de 255), nunca en texto plano.
- El RUT se guarda sin puntos ni guion, con un máximo de 9 caracteres (ej. `123456785`).
- **Cambios en el esquema:** las tablas se crean con SQL directamente en Neon y el backend solo las mapea (no se usan migraciones de EF Core). Todo cambio de tabla va en el mismo pull request que actualiza su mapeo en `AppDbContext` y su modelo, y se avisa al equipo.

---

## 4. Conexión de la base de datos con el backend

1. **Paquetes NuGet** (ya en `BackTecnoFix.csproj`, se restauran con `dotnet restore`): `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`, `BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.OpenApi`.
2. **Secretos en user-secrets**, nunca en `appsettings.json` ni en GitHub:
   ```bash
   cd Backend/BackTecnoFix
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<host>.neon.tech;Database=<db>;Username=<user>;Password=<password>;SSL Mode=Require"
   dotnet user-secrets set "Jwt:Key" "<clave de al menos 32 caracteres>"
   dotnet user-secrets list
   ```
   Las credenciales se comparten por un canal privado del equipo. En `appsettings.json` solo quedan valores no sensibles (`Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpirationMinutes`).
3. **Registrar el `DbContext`** en `Program.cs` con `UseNpgsql` y `MapEnum` para cada enum, usando `NpgsqlNullNameTranslator` para que los valores viajen tal cual.
4. **Mapear las tablas** en `AppDbContext`: un `DbSet` por tabla y, en `OnModelCreating`, `ToTable` y un `HasColumnName` por cada columna (camelCase en C#, snake_case en la base).
5. **Consultar solo desde un Repository**, que recibe el `AppDbContext` por constructor.
6. **Registrar las dependencias** en `Program.cs`: cada par interfaz/implementación con `AddScoped`.
7. **Verificar** con `dotnet run` y una petición de login a `http://localhost:5032/api/auth/login`.

### Errores frecuentes

| Error | Causa habitual |
|---|---|
| `value too long for type character varying(n)` | Un valor supera el largo de la columna (ej. RUT con puntos y guion) |
| `relation "..." does not exist` | El nombre en `ToTable` no coincide exactamente con la tabla |
| `column "..." does not exist` | Falta el `HasColumnName` de esa propiedad |
| `Object reference not set` / `Jwt:Key` nulo | Faltan los user-secrets en ese equipo |
| Error de conexión o SSL | Host o contraseña mal copiados, o falta `SSL Mode=Require`. Neon puede tardar en despertar |
| Error al leer un enum | El nombre en `MapEnum` no coincide con el tipo de la base |

---

## 5. Comunicación entre frontend y backend

- **Rutas:** `api/<recurso>` en minúsculas. El backend escucha en `http://localhost:5032`.
- **Formato:** JSON con propiedades en camelCase.
- **CORS:** política `"Frontend"` en `Program.cs`, que en local permite solo `http://localhost:5173`. El orden del pipeline es fijo: `UseCors`, `UseAuthentication`, `UseAuthorization`, `MapControllers`.
- **Errores:** `{ "message": "..." }` con su código HTTP: 400 (datos inválidos), 401 (credenciales o sesión inválidas), 403 (rol sin permiso), 409 (dato ya existente). El frontend muestra ese `message` sin modificarlo.
- **Sesión:** el login entrega un JWT con id, correo y rol, válido por `Jwt:ExpirationMinutes` (60 minutos).
- **Autorización:** los endpoints protegidos usan `[Authorize]` o `[Authorize(Roles = "...")]`. El rol lo asigna siempre el servidor; nunca se acepta desde el cuerpo de la petición.

---

## 6. Conexión del frontend con el backend

### Levantar el proyecto

1. Requisitos: Node.js LTS con npm, .NET 10 SDK y los user-secrets configurados.
2. Backend: `cd Backend/BackTecnoFix && dotnet run` (queda en `http://localhost:5032`).
3. Frontend: `cd Frontend/mi-login && npm install && npm run dev` (queda en `http://localhost:5173`).

> **Importante:** CORS solo acepta el puerto 5173. Si Vite usa otro puerto porque el 5173 está ocupado, cierra el proceso que lo ocupa y vuelve a ejecutar `npm run dev`.

### Reglas al conectar

- La URL de la API se define en un solo lugar y todas las llamadas la reutilizan.
- Los errores se muestran con el color `#F56558` y con el texto exacto del backend. Si el servidor no responde: "No se pudo conectar con el servidor".
- Si un endpoint protegido responde 401, la sesión se cierra y se vuelve al login.

### Conectar una pantalla nueva

1. Crear el endpoint respetando las capas: DTO, método en el Repository, regla en el Service y ruta en el Controller.
2. Registrar el servicio o repositorio en `Program.cs` y probar la ruta.
3. Crear el componente en `src/components`, recibiendo datos y acciones por props.
4. Escribir la llamada a la API (enviando la sesión si la ruta es protegida).
5. Mostrar el `message` que devuelve el backend cuando hay error.
6. Probar con cada rol que tenga acceso y abrir el pull request.

### Problemas frecuentes

| Síntoma | Causa habitual |
|---|---|
| "No se pudo conectar con el servidor" | El backend no está corriendo o la URL de la API no apunta al puerto 5032 |
| Error de CORS en la consola | Vite está en un puerto distinto de 5173 o el origen no está en la política `"Frontend"` |
| "Correo electrónico o contraseña incorrectos" | Credenciales inválidas o técnico deshabilitado (mensaje correcto del sistema) |
| Error 500 al iniciar sesión | Faltan los user-secrets (`Jwt:Key` o la cadena de conexión) |
| Al recargar vuelve al login | La sesión expiró (60 minutos) |

---

## 7. Control de versiones (GitHub)

### 7.1 Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable. Solo recibe cambios desde `test`. |
| `test` | Integración y pruebas. Recibe los pull requests de las ramas personales. |
| `DevCatalina`, `DevNicolas`, `DevJoaquin`, `DevRomina` | Ramas personales |

- Cada integrante trabaja **solo en su rama personal** (`Dev` + nombre en PascalCase, sin tildes).
- **Nadie sube directamente a `test` ni a `main`**: los cambios llegan siempre por pull request.
- No se usa `git push --force` en ramas que otras personas puedan estar usando.

### 7.2 Formato del commit

```text
[<Branch>] <type>(<scope>): <description in English>
```

```text
[DevCatalina] feat(auth): add JWT login with role-based access
[DevCatalina] fix(auth): show error when technician is disabled
[DevCatalina] refactor(repositories): rename UserRespository to UserRepository
[DevCatalina] docs: update programming standard
```

- **Rama:** entre corchetes, al comienzo.
- **Tipo:** en minúsculas, de la tabla de abajo.
- **Alcance (opcional):** la parte del sistema que cambia (`auth`, `dashboard`, `orders`, `frontend`, `backend`, `database`, `deps`).
- **Descripción:** en inglés, modo imperativo, en minúscula, sin punto final, máximo 72 caracteres.
- **Un commit = un cambio lógico.** Si tocaste frontend y backend, haz dos commits.

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad (sube MINOR) |
| `fix` | Corrección de un error (sube PATCH) |
| `docs` | Solo documentación |
| `style` | Formato, sin cambios de lógica |
| `refactor` | Reorganización sin cambiar el comportamiento |
| `test` | Agregar o corregir pruebas |
| `chore` | Mantenimiento, configuración o dependencias |

### 7.3 Flujo de trabajo

1. **Actualizar tu rama:**
   ```bash
   git checkout DevCatalina
   git fetch origin
   git merge origin/test
   ```
2. **Revisar los cambios** con `git status` y `git diff`. Comprueba que no haya credenciales, `bin/`, `obj/` ni `node_modules/`.
3. **Preparar archivos concretos** (`git add Frontend/`, `git add Backend/`) en lugar de `git add .`. Saca lo que no corresponda con `git reset <ruta>`.
4. **Hacer el commit** con el formato de 7.2.
5. **Subir tu rama:** `git push origin DevCatalina` (`-u` la primera vez). Si el push es rechazado: `git pull --rebase origin DevCatalina` y repite.
6. **Abrir el pull request hacia `test`:**
   - Base `test`, compare tu rama. Título con el formato del commit.
   - Descripción:
     ```markdown
     ## Changes
     - What changed and why

     ## How to test
     1. Steps to check that it works
     ```
   - Asigna al menos un revisor. Si no está listo, ábrelo como **Draft**.
   - Los cambios pedidos se hacen con nuevos commits en tu rama (`[DevCatalina] fix: address review comments`).
   - Quien revisa hace el merge a `test`.
7. **Llevar a `main`:** una vez probado en `test`, se abre un pull request con base `main` y compare `test`, que resume lo que se libera. Tras el merge se crea el tag de versión.
8. **Volver a sincronizar tu rama** con `git merge origin/test`.

### 7.4 Resolver conflictos

Abre el archivo en VS Code, elige **Accept Current**, **Accept Incoming** o **Accept Both**, guarda y termina con:

```bash
git add <archivo>
git commit -m "[DevCatalina] chore: resolve merge conflicts with test"
git push origin DevCatalina
```

Ante la duda, consulta con quien modificó el mismo archivo.

### 7.5 Qué nunca se sube

- Credenciales o claves (cadena de conexión, `Jwt:Key`, contraseñas): van en user-secrets.
- `bin/`, `obj/`, `.vs/`, `.vscode/` y `*.user`.
- `node_modules/` y `dist/`.
- Archivos personales del editor o del equipo.

### 7.6 Versiones

Versionado semántico (`MAJOR.MINOR.PATCH`). Al cerrar una iteración se crea un tag sobre `main`, con mensaje en inglés:

```bash
git checkout main
git pull origin main
git tag -a v0.1.0 -m "Iteration 1: login and dashboard"
git push origin v0.1.0
```

### 7.7 Trabajar sobre la rama de otro integrante

Práctica **temporal**, solo mientras el pull request de esa persona está pendiente y con acuerdo previo del equipo.

```bash
git checkout DevNicolas
git fetch origin
git merge origin/DevCatalina
```

**Reglas**

- Nadie hace commits en la rama de otra persona.
- La dueña o el dueño de la rama avisa cuando sube algo de lo que otros dependen.
- La dueña o el dueño no usa `git push --force` ni `git rebase` sobre una rama que otros ya usan.
- El pull request hacia `test` se abre lo antes posible (puede ser Draft).
- Una vez integrado en `test`, todos se actualizan desde `test` con `git merge origin/test`.

**Riesgos de mantenerlo mucho tiempo:** dependes de una rama ajena que puede cambiar, aparecen conflictos al integrar, `test` y `main` no tienen ese código, y se construye sobre código sin revisar.

---

## 8. Herramientas

- **IDE:** Visual Studio Code.
- **Backend:** ASP.NET Core (.NET 10), Entity Framework Core, Npgsql, BCrypt y JWT.
- **Frontend:** React 19 con Vite, componentes en TypeScript y ESLint (`npm run lint`).
- **Base de datos:** PostgreSQL en Neon, administrada desde su SQL Editor.
- **Control de versiones:** Git y GitHub.
