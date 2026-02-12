# Guía de Despliegue (GitHub y Vercel)

Sigue estos pasos para desplegar tu proyecto en Vercel.

## 1. Código en GitHub

Tu código ya ha sido subido exitosamente al repositorio: `https://github.com/tenseihikarinoyami-lang/sistema-medico-n`.

## 2. Desplegar en Vercel

1.  **Crear Proyecto**:
    *   Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
    *   Haz clic en "Add New..." -> "Project".
    *   Selecciona el repositorio `sistema-medico` y haz clic en "Import".

2.  **Configurar Build**:
    *   Framework Preset: **Vite** (Debería detectarlo automáticamente).
    *   Root Directory: `./` (Dejar por defecto).
    *   Build Command: `npm run build` (Dejar por defecto).

3.  **Variables de Entorno (IMPORTANTE)**:
    *   Despliega la sección **Environment Variables**.
    *   Añade las mismas variables que tienes en tu `.env` local:
        *   **Name**: `VITE_INSFORGE_URL`
            *   **Value**: Tu URL de InsForge (ej. `https://api.insforge.com/v1/projects/...`)
        *   **Name**: `VITE_INSFORGE_KEY`
            *   **Value**: Tu API Key de InsForge.
    *   Haz clic en "Add" para cada una.

4.  **Desplegar**:
    *   Haz clic en **Deploy**.
    *   Espera a que termine el proceso. Vercel te dará una URL (ej. `sistema-medico.vercel.app`).

## 3. Verificación Final

1.  Abre la URL que te dio Vercel.
2.  Intenta iniciar sesión.
3.  Si ves un error, revisa las variables de entorno en Vercel (Settings -> Environment Variables) y asegúrate de que sean correctas.
4.  Si necesitas regenerar el despliegue, ve a "Deployments", haz clic en los 3 puntos del último commit y selecciona "Redeploy".
