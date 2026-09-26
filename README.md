# TecnoFix


## Sistema Web de Gestión de Servicio Técnico

**TecnoFix** es un sistema web orientado a la gestión de un servicio técnico de reparación de equipos electrónicos y computacionales.

El sistema permitirá administrar el ciclo completo de una orden de reparación, desde la recepción del equipo hasta su entrega al cliente, manteniendo trazabilidad sobre los cambios de estado y permitiendo al cliente consultar el progreso de sus reparaciones.

Proyecto desarrollado para la asignatura **Ingeniería de Software — Segundo Semestre 2026**.

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

## Stack Tecnológico

### Backend

- **Lenguaje:** C#
- **Framework:** .NET 10
- **Arquitectura:** Clean Architecture
- **Patrones:** MVC, Repository Pattern y arquitectura en capas

### Frontend

- **Lenguaje:** TypeScript
- **Framework:** React (Vite)
- **Arquitectura:** Basada en componentes
- **Gestión de paquetes:** NPM
- **Entorno:** Node.js

### Base de Datos

- **DBMS:** PostgreSQL
- **Plataforma:** Neon

---

## Estructura Actual

```text
TecnoFix/
│
├── Backend/
│   └── BackTecnoFix/
│       ├── Controller/
│       ├── Data/
│       ├── DTO/
│       │   ├── LoginRequestDTO.cs
│       │   └── LoginResponseDTO.cs
│       ├── Models/
│       │   ├── Admin.cs
│       │   ├── Client.cs
│       │   ├── Engineer.cs
│       │   └── User.cs
│       ├── Properties/
│       ├── Services/
│       ├── Program.cs
│       ├── BackTecnoFix.csproj
│       └── appsettings.json
│
├── Frontend/
│   └── mi-login/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   └── TecnoFixLogin.tsx
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
├── .gitattributes
├── .gitignore
└── README.md
```

Los directorios `bin/`, `obj/` y `node_modules/` generados automáticamente se encuentran excluidos del control de versiones mediante `.gitignore`.

---

## Arquitectura

TecnoFix contempla el uso de **Clean Architecture** para mantener una adecuada separación de responsabilidades, alta cohesión y bajo acoplamiento.

El Backend utilizará:

- MVC.
- Repository Pattern.
- Arquitectura en capas.

El Frontend se desarrolla mediante una arquitectura basada en componentes, usando React con TypeScript y Vite como entorno de desarrollo y build.

---

## Frontend

El frontend vive en `Frontend/mi-login/` y se construye con **React + TypeScript sobre Vite**.

Hasta el momento se implementó:

- **Pantalla de inicio de sesión** (`src/components/TecnoFixLogin.tsx`), con formulario controlado (email y contraseña), toggle de mostrar/ocultar contraseña, validación básica de campos y una prop `onSubmit` para conectar la autenticación con el backend.
- Estilos propios del componente (sin dependencias externas de CSS), incluyendo la carga de la tipografía Inter y el reset de márgenes del navegador.

### Cómo correr el frontend

```bash
cd Frontend/mi-login
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173` (o el siguiente puerto libre, ej. `5174`).

---

## Estado del Proyecto

**En desarrollo.**

Actualmente se encuentra implementada:

- La estructura inicial del Backend en .NET, incluyendo los modelos `User`, `Client`, `Engineer` y `Admin`, y los DTOs de login (`LoginRequestDTO`, `LoginResponseDTO`).
- La interfaz de inicio de sesión del Frontend en React + TypeScript.

Las siguientes etapas contemplan la implementación progresiva de:

- Conexión del formulario de login con el Backend (autenticación real).
- Persistencia con PostgreSQL y Neon.
- Autorización por roles.
- Repository Pattern.
- Gestión de órdenes, diagnósticos y presupuestos.
- Resto de pantallas del Frontend (registro, dashboard por rol, gestión de órdenes, etc.).

---

## Documentación

El desarrollo se basa en la **Especificación de Requerimientos de Software (ERS)** de TecnoFix, que define los requerimientos funcionales, no funcionales, reglas de negocio, roles y validaciones del sistema.

---

## Información Académica

**Asignatura:** Ingeniería de Software  
**Periodo:** Segundo Semestre 2026  
**Proyecto:** TecnoFix
