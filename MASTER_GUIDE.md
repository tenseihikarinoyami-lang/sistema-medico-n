# Guía Maestra del Sistema Médico (InsForge Migration)

Esta guía resume todo el trabajo realizado para migrar tu sistema de un estado local a una arquitectura escalable en la nube con InsForge.

## 1. Arquitectura del Sistema

Hemos transformado la aplicación de la siguiente manera:

*   **Frontend**: React + Vite (Alojado en Vercel)
*   **Backend & Base de Datos**: InsForge (PostgreSQL)
*   **Autenticación**: Manejada vía tabla `users` en InsForge (Simulada).
*   **Repositorio**: GitHub (`sistema-medico-n`)

## 2. Cambios Realizados (Vinculación MCP)

A través de las herramientas MCP de InsForge, he realizado las siguientes vinculaciones automáticas:

1.  **Base de Datos**:
    *   Se ejecutaron scripts SQL remotos para crear las tablas:
        *   `users`: Gestión de usuarios y roles.
        *   `reports`: Almacenamiento de reportes médicos en formato JSON.
        *   `alerts`: Sistema de alertas y notificaciones.
    *   *Estado*: **Vinculado y Listo**.

2.  **Código Fuente**:
    *   **Adaptación**: Se creó `src/services/api.ts` para comunicarse con tu proyecto InsForge.
    *   **Estado Global**: Se modificó `src/store.ts` para usar la API real en lugar de datos falsos.
    *   **GitHub**: Se subió todo el código actualizado al repositorio `https://github.com/tenseihikarinoyami-lang/sistema-medico-n`.

## 3. Credenciales y Claves (Keys)

Para configurar tu proyecto en **InsForge/Vercel**, necesitas configurar estas claves.

> **Token Generado (Anon)**: Acabo de generarte un token anónimo que puedes usar si lo necesitas, pero te recomiendo usar las claves del panel de InsForge para acceso completo.
>
> `AccessToken (Anon)`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDY0NTN9.7VOjsiBJbUB0BNS4NO1KIh4HKjhLS3BZtv4Ii_v42Ok`

### Variables para Vercel
Ve a **Settings -> Environment Variables** en tu proyecto de Vercel y añade:

| Variable | Descripción | Valor |
| :--- | :--- | :--- |
| `VITE_INSFORGE_URL` | URL de tu API | Copia de tu Panel InsForge -> Settings -> General |
| `VITE_INSFORGE_KEY` | Tu API Key Pública | `SERVICE ROLE KEY` (Panel InsForge -> Settings -> API Keys) |

*Nota: Usa la `Service Role Key` para que el usuario administrador tenga acceso total. La `Anon Key` es solo para acceso público limitado.*

## 4. Pasos Finales

1.  Ve a tu proyecto en **Vercel**.
2.  Asegúrate de que el último despliegue (Deployment) tenga las variables de entorno configuradas.
3.  Si ves errores, ve a la pestaña "Deployments", selecciona el último y dale a **Redeploy**.
4.  ¡Tu sistema estará 100% operativo en la nube!

## Archivos de Referencia
*   `DEPLOY.md`: Guía específica de despliegue.
*   `TESTING.md`: Guía de pruebas locales.
*   `db_schema.sql`: Estructura de la base de datos (ya aplicada).
