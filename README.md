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
- **Framework:** React
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
│       ├── Models/
│       ├── Properties/
│       ├── Services/
│       ├── Program.cs
│       ├── TecnoFixBack.csproj
│       └── appsettings.json
│
├── Frontend/
│
├── .gitattributes
├── .gitignore
└── README.md
```

Los directorios `bin/` y `obj/` generados por .NET se encuentran excluidos del control de versiones mediante `.gitignore`.

---

## Arquitectura

TecnoFix contempla el uso de **Clean Architecture** para mantener una adecuada separación de responsabilidades, alta cohesión y bajo acoplamiento.

El Backend utilizará:

- MVC.
- Repository Pattern.
- Arquitectura en capas.

El Frontend será desarrollado mediante una arquitectura basada en componentes utilizando React y TypeScript.

---

## Estado del Proyecto

**En desarrollo.**

Actualmente se encuentra implementada la estructura inicial del Backend en .NET y la separación entre Backend y Frontend.

Las siguientes etapas contemplan la implementación progresiva de:

- Frontend con React y TypeScript.
- Persistencia con PostgreSQL y Neon.
- Autenticación y autorización por roles.
- Repository Pattern.
- Gestión de órdenes, diagnósticos y presupuestos.

---

## Documentación

El desarrollo se basa en la **Especificación de Requerimientos de Software (ERS)** de TecnoFix, que define los requerimientos funcionales, no funcionales, reglas de negocio, roles y validaciones del sistema.

---

## Información Académica

**Asignatura:** Ingeniería de Software  
**Periodo:** Segundo Semestre 2026  
**Proyecto:** TecnoFix
