# TecnoFix


## Sistema Web de Gestión de Servicio Técnico

**TecnoFix** es un sistema web orientado a la gestión de un servicio técnico de reparación de equipos electrónicos y computacionales.

El sistema permitirá administrar el ciclo completo de una orden de reparación, desde la recepción del equipo hasta su entrega al cliente, manteniendo trazabilidad sobre los cambios de estado y permitiendo al cliente consultar el progreso de sus reparaciones.

Proyecto desarrollado para la asignatura **Ingeniería de Software — Segundo Semestre 2026**.

**Aplicación desplegada:** https://tecno-fix-six.vercel.app

---

## Funcionalidades Principales

El sistema contempla las siguientes funcionalidades:

- Autenticación y gestión de usuarios.
- Control de acceso basado en roles.
- Registro de clientes y técnicos.
- Registro y gestión de órdenes de reparación.
- Registro de diagnósticos técnicos.
- Generación de presupuestos.
- Aprobación o rechazo de presupuestos.
- Seguimiento del estado de las reparaciones.
- Historial de cambios de una orden.
- Registro de entrega de equipos.
- Gestión de tipos de equipo.
- Consulta de estadísticas.

---

## Roles del Sistema

### Administrador

Responsable de la gestión general del sistema, técnicos, órdenes, catálogos y estadísticas.

### Técnico

Responsable de registrar órdenes, realizar diagnósticos, generar presupuestos, actualizar reparaciones y registrar la entrega de equipos.

### Cliente

Puede registrarse, consultar sus órdenes, revisar su historial y aprobar o rechazar presupuestos.

---

## Ciclo de Vida de una Orden

```text
Recibida
   ↓
En diagnóstico
   ↓
Presupuestada
   ↓
En reparación
   ↓
Lista para retiro
   ↓
Entregada
```

Si el presupuesto es rechazado por el cliente, la orden puede pasar al estado `Rechazada`.

Cada cambio de estado queda registrado en una bitácora con fecha, hora y usuario responsable.

---

## Estado del Proyecto

### Módulos implementados

| Requerimiento | Módulo | Backend | Frontend |
|---|---|---|---|
| USU-001 | Inicio de sesión por rol con JWT en cookie HttpOnly | ✅ | ✅ |
| USU-002 | Registro de clientes con contraseña temporal | ✅ | ✅ |
| USU-003 / USU-004 | Ver datos personales y cambiar contraseña (con diálogo de confirmación) | ✅ | ✅ |
| — | Registro de técnicos (solo administrador) | ✅ | ✅ |
| ADM-001 | Catálogo de tipos de equipo: crear, editar, habilitar y deshabilitar (solo administrador) | ✅ | ✅ |
| ORD-001 | Registro de órdenes de reparación (administrador y técnico) | ✅ | ✅ |
| ORD-002 | Diagnóstico técnico y presupuesto (técnico) | ✅ | ✅ |
| ORD-003 | Consulta de órdenes y aprobación o rechazo del presupuesto (cliente) | ✅ | ✅ |
| — | Panel por rol (administrador, técnico y cliente) | — | ✅ (secciones pendientes muestran «Próximamente») |

Pendientes: actualización del estado de la reparación, registro de entrega, historial visible de la orden y estadísticas.

### Transiciones de estado implementadas

| Acción | Quién | Estado |
|---|---|---|
| Registrar la orden (ORD-001) | Administrador o técnico | → `Recibida` |
| Abrir la orden para diagnosticar (ORD-002) | Técnico | `Recibida` → `En diagnóstico` |
| Registrar diagnóstico y presupuesto (ORD-002) | Técnico | `En diagnóstico` → `Presupuestada` |
| Aprobar el presupuesto | Cliente | `Presupuestada` → `En reparación` |
| Rechazar el presupuesto | Cliente | `Presupuestada` → `Rechazada` |

Cada transición agrega una entrada en la bitácora (`order_logs`).

---

## Stack Tecnológico

### Backend

- **Lenguaje:** C#
- **Framework:** ASP.NET Core (.NET 10)
- **ORM:** Entity Framework Core con Npgsql
- **Autenticación:** JWT almacenado en cookie HttpOnly, contraseñas con BCrypt
- **Patrones:** MVC, Repository Pattern y arquitectura en capas
- **Pruebas:** xUnit (proyecto `BackTecnoFix.Tests`)

### Frontend

- **Lenguaje:** TypeScript / JavaScript
- **Framework:** React (Vite)
- **Arquitectura:** Basada en componentes
- **Íconos:** lucide-react
- **Pruebas:** Vitest, Testing Library y jsdom
- **Gestión de paquetes:** NPM

### Base de Datos

- **DBMS:** PostgreSQL
- **Plataforma:** Neon

### Despliegue

- **Frontend:** Vercel
- **Backend:** Render (contenedor Docker)
- **Base de datos:** Neon

---

## Estructura del Proyecto

```text
TecnoFix/
│
├── Backend/
│   ├── BackTecnoFix/
│   │   ├── Controller/          # ClientController, TechnicianController, EquipmentTypeController, RepairOrderController
│   │   ├── Controllers/         # AuthController (login, logout, cambio de contraseña)
│   │   ├── Data/                # AppDbContext y repositorio de clientes
│   │   ├── DTO/                 # Objetos de entrada y salida de la API
│   │   ├── Exceptions/          # BusinessException (mensaje y código HTTP de la ERS)
│   │   ├── Models/              # User, UserRole, EquipmentType, RepairOrder, OrderLog, OrderStatus
│   │   ├── Repositories/        # UserRepository, TechnicianRepository, EquipmentTypeRepository,
│   │   │                        # RepairOrderRepository y TechnicianService (diagnóstico)
│   │   ├── Services/            # AuthService, ClientService, EmailService, EquipmentTypeService, RepairOrderService
│   │   ├── Program.cs
│   │   ├── Dockerfile
│   │   ├── TecnoFixBack.http    # Peticiones de ejemplo para probar la API
│   │   └── appsettings.json
│   ├── BackTecnoFix.Tests/      # Pruebas xUnit: login, cambio de contraseña, técnicos,
│   │                            # órdenes (ORD-001), diagnóstico (ORD-002) y presupuesto
│   ├── Database/                # Scripts SQL para Neon (esquema, sincronización y datos iniciales)
│   └── ChangePassword.md        # Detalle del contrato de cambio de contraseña
│
├── Frontend/
│   └── mi-login/
│       ├── public/              # favicon.svg
│       ├── src/
│       │   ├── Api/             # Cliente HTTP: auth, client, technician, equipmentTypes, repairOrders, diagnosis
│       │   ├── components/      # Pantallas: login, registro, paneles, perfil, técnicos,
│       │   │                    # tipos de equipo, registro de órdenes, diagnóstico y órdenes del cliente
│       │   ├── utils/           # Validaciones y formato de montos y fechas
│       │   ├── test/            # Pruebas con Vitest y Testing Library (ORD-002)
│       │   ├── App.jsx          # Navegación entre pantallas según sesión y rol
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── vitest.config.js
│
├── CONVENTIONS.md               # Convenciones de código, capas, conexión y Git del equipo
└── README.md
```

Los directorios `bin/`, `obj/`, `dist/` y `node_modules/` se generan automáticamente y están excluidos del control de versiones.

---

## API

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Inicia sesión y deja el JWT en la cookie `access_token` | Público |
| `POST` | `/api/auth/logout` | Cierra la sesión eliminando la cookie | Público |
| `PUT` | `/api/auth/change-password` | Cambia la contraseña del usuario autenticado | Usuario con sesión |
| `POST` | `/api/client/register` | Registra un cliente con contraseña temporal | Público |
| `POST` | `/api/technician` | Registra un técnico | Administrador |
| `GET` | `/api/equipment-types` | Lista todos los tipos de equipo | Administrador |
| `GET` | `/api/equipment-types/enabled` | Lista los tipos de equipo habilitados | Usuario con sesión |
| `GET` | `/api/equipment-types/{id}` | Obtiene un tipo de equipo | Administrador |
| `POST` | `/api/equipment-types` | Crea un tipo de equipo | Administrador |
| `PUT` | `/api/equipment-types/{id}` | Edita un tipo de equipo | Administrador |
| `PATCH` | `/api/equipment-types/{id}/status` | Habilita o deshabilita un tipo de equipo | Administrador |
| `GET` | `/api/repair-orders/clients` | Lista los clientes para el formulario de orden | Administrador, técnico |
| `POST` | `/api/repair-orders` | Registra una orden de reparación (ORD-001) | Administrador, técnico |
| `GET` | `/api/repair-orders/mine` | Lista las órdenes del cliente con su presupuesto | Cliente |
| `PUT` | `/api/repair-orders/{orderId}/budget-decision` | Aprueba o rechaza el presupuesto | Cliente |
| `GET` | `/api/technician/orders/diagnosis` | Lista las órdenes `Recibida` o `En diagnóstico` (ORD-002) | Técnico |
| `PATCH` | `/api/technician/orders/{orderId}/diagnosis/start` | Abre la orden y la pasa a `En diagnóstico` | Técnico |
| `POST` | `/api/technician/orders/{orderId}/diagnosis` | Registra el diagnóstico y el presupuesto | Técnico |

Los errores responden con un JSON `{ "message": "..." }` con el texto definido en la ERS. En `Backend/BackTecnoFix/TecnoFixBack.http` hay ejemplos de cada petición.

---

## Cómo ejecutar el proyecto en local

### Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20.19 o superior
- Acceso a la base de datos de Neon

### 1. Backend

Los secretos no se guardan en el repositorio. Configúralos una sola vez con *user secrets*, desde `Backend/BackTecnoFix`:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require"
dotnet user-secrets set "Jwt:Key" "una-clave-larga-de-al-menos-32-caracteres"
```

La cadena de conexión debe estar en formato `Host=...;Database=...` (en Neon: **Connect → .NET**), no en formato `postgresql://...`.

Luego ejecuta:

```bash
cd Backend/BackTecnoFix
dotnet run
```

La API queda disponible en `http://localhost:5032`.

Para correr las pruebas:

```bash
cd Backend/BackTecnoFix.Tests
dotnet test
```

### 2. Frontend

```bash
cd Frontend/mi-login
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`. Por defecto se conecta al backend en `http://localhost:5032/api`.

Para correr las pruebas del frontend:

```bash
cd Frontend/mi-login
npm test            # una sola vez
npm run test:watch  # se repiten al guardar cambios
```

En Windows, ejecútalas desde PowerShell: en Git Bash, Vitest a veces falla con *"Vitest failed to find the current suite"* aunque los tests estén bien.

### 3. Base de datos

Los scripts de `Backend/Database/` se ejecutan en el **SQL Editor** de Neon, en orden de fecha:

| Script | Qué hace |
|---|---|
| `2026-10-27_new_schema.sql` | Fase 1: crea `users`, `equipment_types`, `repair_orders` y `order_logs` y copia los usuarios del esquema anterior |
| `2026-10-27_sync_users.sql` | Fase 2: copia a `users` los usuarios creados en las tablas antiguas después de la fase 1; se puede repetir |
| `2026-10-27_drop_old_tables.sql` | Fase 3: elimina las tablas antiguas. **No tiene vuelta atrás**; ejecutar solo con el backend nuevo verificado |
| `2026-11-14_seed_equipment_types.sql` | Carga los tipos de equipo iniciales; se puede repetir sin duplicar |

El formulario de órdenes solo ofrece tipos de equipo habilitados: si la lista aparece vacía, ejecuta el último script o crea tipos desde **Tipos de equipo** con un administrador.

---

## Despliegue

Cada push a `main` despliega automáticamente el frontend en Vercel y el backend en Render.

### Frontend (Vercel)

- **Root Directory:** `Frontend/mi-login`
- **Framework Preset:** Vite
- **Variable de entorno:** `VITE_API_URL` = URL del backend terminada en `/api`

Vite incluye `VITE_API_URL` al compilar, por lo que después de cambiarla hay que hacer **Redeploy**.

### Backend (Render)

- **Tipo:** Web Service con lenguaje **Docker**
- **Root Directory:** `Backend/BackTecnoFix`
- **Variables de entorno:**

| Variable | Valor |
|---|---|
| `ConnectionStrings__DefaultConnection` | Cadena de conexión de Neon en formato `Host=...;Database=...` |
| `Jwt__Key` | Clave para firmar los JWT (mínimo 32 caracteres) |
| `Cors__AllowedOrigins__0` | URL del frontend, sin `/` al final (ej. `https://tecno-fix-six.vercel.app`) |
| `Brevo__ApiKey` | API key de [Brevo](https://www.brevo.com) para enviar las contraseñas temporales por correo |
| `Brevo__SenderEmail` | Correo remitente, verificado en Brevo (ej. `tecnofix.noreply@gmail.com`) |
| `Brevo__SenderName` | Nombre del remitente (opcional; por defecto `TecnoFix`) |

En el plan gratuito de Render el servicio se suspende tras 15 minutos sin uso; la primera petición después de eso puede tardar alrededor de 50 segundos.

---

## Flujo de trabajo con Git

- Cada integrante trabaja en su rama `DevNombre`.
- Los cambios se integran primero en `test` y, una vez revisados, en `main`.
- `main` es la rama que se despliega en producción.
- Formato de los commits, en inglés: `[DevNombre] tipo(alcance): descripción`, por ejemplo `[DevCatalina] feat(orders): ORD-001 register repair order`. Tipos habituales: `feat`, `fix`, `refactor`, `test`, `chore` y `docs`.
- Antes de integrar en `test`, actualiza tu rama con lo último de `test` para resolver los conflictos en tu rama y no en la compartida.

Las reglas completas de ramas, commits y pull requests están en [CONVENTIONS.md](CONVENTIONS.md#7-control-de-versiones-github).

---

## Documentación

El desarrollo se basa en la **Especificación de Requerimientos de Software (ERS)** de TecnoFix, que define los requerimientos funcionales, no funcionales, reglas de negocio, roles y validaciones del sistema.

Las convenciones que sigue el equipo están resumidas en [CONVENTIONS.md](CONVENTIONS.md), a partir del **Estándar de Programación de TecnoFix (Codexia)**: notación e idiomas del código, arquitectura por capas, base de datos, conexión entre frontend y backend, paleta de colores y uso de Git y GitHub.

---

## Información Académica

**Asignatura:** Ingeniería de Software  
**Periodo:** Segundo Semestre 2026  
**Proyecto:** TecnoFix
