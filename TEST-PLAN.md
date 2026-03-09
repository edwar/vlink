# Plan de Pruebas (TEST-PLAN)

Este documento registra todas las pruebas desarrolladas en el proyecto, así como las pruebas propuestas para garantizar la estabilidad, seguridad y correcto funcionamiento de la plataforma.

---

## 1. Pruebas Existentes (Desarrolladas)

Actualmente, el proyecto cuenta con pruebas unitarias y de integración enfocadas en los Server Actions principales, utilizando **Vitest** y simulando (mocking) la base de datos con Prisma.

### 1.1 Pruebas de Reservas (`booking.test.ts`)
- **Ubicación:** `app/actions/booking.test.ts`
- **Tipo:** Unitarias
- **Cobertura:**
  - `getAvailableSlots`:
    - Verifica el manejo de errores cuando el perfil no existe.
    - Asegura que se retorne un arreglo vacío si el profesional no tiene disponibilidad recurrente.
    - Valida la generación correcta de *slots* basados en la configuración de disponibilidad recurrente.
    - Filtra adecuadamente los *slots* basándose en bloqueos específicos (vacaciones, excepciones).
    - Omite horas que ya están ocupadas por citas existentes.
    - Respeta la configuración de `advanceNoticeHours` (horas de antelación requeridas para reservar).

### 1.2 Pruebas de Disponibilidad (`availability.integration.test.ts`)
- **Ubicación:** `app/actions/availability.integration.test.ts`
- **Tipo:** Integración (Mocks de Prisma)
- **Cobertura:**
  - `getAvailability`: Retorna la disponibilidad del perfil o un arreglo vacío si no hay datos.
  - `updateAvailability`: Verifica el uso de transacciones para actualizar horarios recurrentes.
  - `addSpecialBlock`: Confirma la creación de bloqueos específicos (días libres/vacaciones).
  - `deleteAvailability`: Asegura la eliminación correcta de registros de disponibilidad.
  - `getAppointmentsForDashboard`: Comprueba que solo se retornen citas que no estén canceladas.

### 1.3 Pruebas de Servicios (`services.integration.test.ts`)
- **Ubicación:** `app/actions/services.integration.test.ts`
- **Tipo:** Integración (Mocks de Prisma)
- **Cobertura:**
  - `getConfiguration`: Retorna correctamente los datos del perfil y los servicios activos.
  - `updateConfiguration`: Verifica la actualización del perfil y restringe valores inválidos (nombre vacío, horas negativas).
  - `createService`: Valida la creación de un nuevo servicio y que el nombre sea obligatorio.
  - `updateService`: Asegura que un servicio solo se actualice si pertenece al profesional.
  - `deleteService`: Verifica que se pueda eliminar un servicio comprobando antes la propiedad.

---

## 2. Pruebas Propuestas (Para Proteger el Proyecto)

Para blindar la plataforma y asegurar que las refactorizaciones o nuevas características no rompan la funcionalidad existente, se proponen las siguientes pruebas:

### 2.1 Pruebas Unitarias y de Integración Adicionales (Backend / Actions)

- **Gestión de Organizaciones (`organization.ts`)**
  - **Creación:** Verificar que al crear una organización, el usuario queda como `OWNER` y no se permiten nombres duplicados.
  - **Invitaciones:** Probar la lógica de límites de asientos (integración con `planConfig`) antes de generar tokens de invitación. Validar expiración de tokens.
  - **Roles:** Asegurar que solo un `OWNER` pueda cambiar roles o eliminar miembros, y que un `OWNER` no pueda eliminar a otro `OWNER`.
  - **Transferencia de propiedad:** Verificar el intercambio atómico de roles al transferir el ownership.

- **Procesos en Segundo Plano (Cron Jobs)**
  - **Mantenimiento de Facturación (`billing-maintenance.ts`):** Validar que las organizaciones cuyo `gracePeriodEnd` haya expirado sean degradadas correctamente al plan `FREE` y se envíe el correo correspondiente.

- **Autenticación y Sesiones**
  - Verificar que las rutas protegidas expulsen correctamente a usuarios sin sesión válida.
  - Validar los flujos de `Better-Auth` (registro, login, verificación de email).

### 2.2 Pruebas de Componentes UI (Frontend)

Se recomienda el uso de **Jest** + **React Testing Library** para asegurar que la interfaz reacciona correctamente a los datos:

- **Componente de Reservas (Client-Facing):** Simular clics en el calendario y selección de horas. Validar que no se puedan seleccionar horas pasadas o bloqueadas.
- **Dashboard del Profesional:** Verificar que las citas confirmadas aparezcan correctamente en la vista de lista/calendario.
- **Formularios de Configuración:** Comprobar validaciones *client-side* en formularios de creación de servicios y actualización de perfil, asegurando que muestren errores si los datos son inválidos antes de llamar a las actions.

### 2.3 Pruebas End-to-End (E2E)

Utilizar un framework como **Playwright** o **Cypress** para probar los flujos críticos (User Journeys) tal como los experimentaría un usuario real:

1. **Flujo Cita Cliente (Critical Path):**
   - Un cliente visita el enlace público del profesional.
   - Selecciona un servicio, fecha y hora válida.
   - Llena el formulario con su nombre, email y teléfono.
   - Confirma la reserva y ve la pantalla de éxito.
   - *Verificación oculta:* Se revisa que el registro haya llegado a la base de datos y se haya enviado el correo.

2. **Flujo Onboarding Profesional:**
   - Un usuario nuevo se registra.
   - Crea su organización.
   - Configura un servicio base y sus horarios de disponibilidad.
   - Verifica que su página pública refleje los cambios.

3. **Flujo de Cancelación:**
   - Usar el token de cancelación simulando a un cliente y comprobar que el estado de la cita cambie a `CANCELLED` y el *slot* de tiempo se libere en el calendario público.

### 2.4 Pruebas Funcionales Específicas del Negocio

- **Google Calendar Sync:** Mockear la API de Google y validar que la creación/cancelación de citas en VLink dispare las llamadas correctas (`createGoogleCalendarEvent`, `deleteGoogleCalendarEvent`).
- **Webhooks:** Simular eventos de webhook entrantes de Google Calendar y asegurar que la base de datos se actualice correctamente (sincronización bidireccional).

---

## 3. Estrategia de Ejecución

- **Integración Continua (CI):** Ejecutar pruebas unitarias y de integración automáticamente en cada `push` o `Pull Request` usando GitHub Actions o Vercel Pipelines.
- **Bloqueo de Despliegues:** Configurar el pipeline para no permitir despliegues a producción si alguna prueba de integración o E2E crítica falla.
- **Mantenimiento:** Actualizar este `TEST-PLAN.md` cada vez que se agregue una nueva suite de pruebas o módulo al sistema.
