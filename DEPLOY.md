# Guía de Despliegue (GitHub y Vercel)

Sigue estos pasos para subir tu proyecto a GitHub y desplegarlo en Vercel.

## 1. Subir a GitHub

1.  **Inicializar Git** (si no lo has hecho):
    ```bash
    git init
    git add .
    git commit -m "Migración a InsForge completada"
    ```

2.  **Crear Repositorio en GitHub**:
    *   Ve a [GitHub.com](https://github.com) y crea un nuevo repositorio (ej. `sistema-medico`).
    *   No marques "Initialize with README" ni añadas `.gitignore` (ya tienes uno).

3.  **Conectar y Subir**:
    *   Copia los comandos que te da GitHub, parecidos a estos:
        ```bash
        git remote add origin https://github.com/TU_USUARIO/sistema-medico.git
        git branch -M main
        git push -u origin main
        ```

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
