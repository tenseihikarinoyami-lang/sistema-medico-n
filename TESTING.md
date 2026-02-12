# Instrucciones de Prueba

Esta guía explica cómo probar la aplicación localmente con la nueva integración de InsForge.

## Requisitos Previos

1.  **Proyecto InsForge**: Debes tener un proyecto activo en InsForge.
2.  **Configuración de Base de Datos**: Necesitas ejecutar el script SQL para crear las tablas necesarias.

## Pasos de Configuración

1.  **Configuración de la Base de Datos**:
    *   Ve al panel de control de tu proyecto en InsForge.
    *   Abre el Editor SQL o la interfaz de Base de Datos.
    *   Copia el contenido de `db_schema.sql` (ubicado en la raíz del proyecto) y ejecútalo. Esto creará las tablas `users` (usuarios), `reports` (reportes) y `alerts` (alertas).
    *   *Opcional*: Inserta manualmente un usuario administrador para comenzar:
        ```sql
        INSERT INTO users (username, password, role, name, profile_completed)
        VALUES ('admin', 'admin123', 'administrador', 'Usuario Admin', true);
        ```

2.  **Variables de Entorno**:
    *   Copia el archivo `.env.example` a un nuevo archivo llamado `.env`.
        ```bash
        cp .env.example .env
        ```
    *   Abre `.env` y completa tus datos de InsForge:
        *   `VITE_INSFORGE_URL`: La URL de la API de tu proyecto (ej. `https://api.insforge.com/v1/projects/TU_ID`).
        *   `VITE_INSFORGE_KEY`: La clave API de tu proyecto.

3.  **Ejecutar la Aplicación**:
    *   Instala las dependencias (si no lo has hecho):
        ```bash
        npm install
        ```
    *   Inicia el servidor de desarrollo:
        ```bash
        npm run dev
        ```

## Escenarios de Verificación

### 1. Iniciar Sesión (Login)
*   **Acción**: Abre la aplicación e inicia sesión con el usuario que creaste (ej. `admin` / `admin123`).
*   **Esperado**: Deberías ser redirigido al Panel Principal (Dashboard). El indicador de carga debería aparecer brevemente durante la autenticación.

### 2. Crear un Reporte
*   **Acción**: Ve a "Crear Nuevo Reporte" (Wizard). Selecciona una plantilla y completa algunos datos. Haz clic en "Guardar".
*   **Esperado**: Deberías ser redirigido al Dashboard. El nuevo reporte debería aparecer en la lista de "Reportes Recientes".
*   **Verificar**: Recarga la página. El reporte debería seguir ahí (cargado desde InsForge).

### 3. Alertas
*   **Acción**: Ve a la vista de "Alertas".
*   **Esperado**: Si tienes alertas en la base de datos, deberían aparecer. Si está vacía, debería mostrar "No hay alertas".

### Solución de Problemas
*   **Errores de Red**: Revisa la consola del navegador (F12) para ver si hay errores 401 (No autorizado) o 404 (No encontrado). Asegúrate de que tu `VITE_INSFORGE_URL` y `KEY` sean correctos.
*   **Carga Bloqueada**: Si el indicador de carga nunca desaparece, revisa la consola por errores. Usualmente significa que la petición a la API falló o excedió el tiempo de espera.
