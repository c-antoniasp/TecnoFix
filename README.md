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
| USU-003 / USU-004 | Ver datos personales y cambiar contraseña | ✅ | ✅ |
| — | Registro de técnicos (solo administrador) | ✅ | ✅ |
| — | Panel por rol (administrador, técnico y cliente) | — | ✅ (datos de demostración) |

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
│   │   ├── Controller/          # ClienteController, TechnicianController
│   │   ├── Controllers/         # AuthController (login, logout, cambio de contraseña)
│   │   ├── Data/                # AppDbContext y repositorio de clientes
│   │   ├── DTO/                 # Objetos de entrada y salida de la API
│   │   ├── Exceptions/
│   │   ├── Models/              # User, Client, Technician, Administrator, UserRole
│   │   ├── Repositories/        # UserRepository, EngineerRepository, TechnicianService
│   │   ├── Services/            # AuthService, ClientService, EmailService
│   │   ├── Program.cs
│   │   ├── Dockerfile
│   │   ├── TecnoFixBack.http    # Peticiones de ejemplo para probar la API
│   │   └── appsettings.json
│   ├── BackTecnoFix.Tests/      # Pruebas de login y cambio de contraseña
│   └── ChangePassword.md        # Detalle del contrato de cambio de contraseña
│
├── Frontend/
│   └── mi-login/
│       ├── public/              # favicon.svg
│       ├── src/
│       │   ├── Api/             # Cliente HTTP (auth.ts, client.ts, technician.ts)
│       │   ├── components/      # Pantallas: login, registro, paneles, perfil, técnicos
│       │   ├── App.jsx          # Navegación entre pantallas según sesión y rol
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
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
| `POST` | `/api/cliente/registro` | Registra un cliente con contraseña temporal | Público |
| `POST` | `/api/technician` | Registra un técnico | Administrador |

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

En el plan gratuito de Render el servicio se suspende tras 15 minutos sin uso; la primera petición después de eso puede tardar alrededor de 50 segundos.

---

## Flujo de trabajo con Git

- Cada integrante trabaja en su rama `DevNombre`.
- Los cambios se integran primero en `test` y, una vez revisados, en `main`.
- `main` es la rama que se despliega en producción.

---

## Documentación

El desarrollo se basa en la **Especificación de Requerimientos de Software (ERS)** de TecnoFix, que define los requerimientos funcionales, no funcionales, reglas de negocio, roles y validaciones del sistema.

---

## Información Académica

**Asignatura:** Ingeniería de Software  
**Periodo:** Segundo Semestre 2026  
**Proyecto:** TecnoFix
