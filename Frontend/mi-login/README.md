# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Panel de diagnóstico (ORD-002)

El panel de técnico consume los endpoints:

- `GET /api/technician/orders/diagnosis`
- `PATCH /api/technician/orders/{orderId}/diagnosis/start`
- `POST /api/technician/orders/{orderId}/diagnosis`

Mientras esta rama no tenga `/api/auth/login`, en desarrollo se puede pegar un
token JWT de técnico o administrador en la sección **Sesión de prueba** de la
pantalla de login. El token de técnico se puede generar con:

```bash
dotnet user-jwts create --name "3" --role TECHNICIAN --claim "nameid=3" --output token
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
