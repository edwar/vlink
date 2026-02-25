# Definición de Alcance y Objetivos - Proyecto VLink

VLink es una plataforma de gestión de citas diseñada para facilitar la programación entre profesionales (clientes) y sus usuarios finales, con una profunda integración con Google Calendar y validación vía WhatsApp.

## 1. Objetivos Principales
- Proporcionar una herramienta de agendamiento eficiente y minimalista.
- Automatizar la sincronización con Google Calendar.
- Simplificar el acceso de los usuarios finales mediante validación por WhatsApp (sin contraseñas).
- Ofrecer una experiencia de usuario premium, priorizando dispositivos móviles.

## 2. Alcance del Proyecto

### A. Autenticación y Perfil (Profesionales)
- **Login con Google:** Acceso obligatorio mediante Google OAuth para sincronización de calendarios.
- **Link Único:** Cada profesional tendrá una URL personalizada (ej: `vlink.app/profesional-xyz`) para compartir con sus clientes.

### B. Gestión de Agenda (Panel de Control)
- **Visualización de Calendario:** Vista de agenda por horas, clara y funcional.
- **Bloqueos Recurrentes:** Configuración de días y horas no laborables (ej: "No trabajo lunes y martes").
- **Bloqueos Puntuales:** Capacidad de bloquear fechas específicas para vacaciones, citas médicas o descansos.

### C. Sistema de Agendamiento (Usuarios Finales)
- **Flujo de Registro por WhatsApp:**
  1. El usuario ingresa su número de WhatsApp.
  2. Recibe un código temporal (OTP) vía WhatsApp.
  3. Ingresa el código en un modal para validar su identidad.
- **Reserva de Cita:** 
  1. Selección de horario basado en la disponibilidad real del profesional.
  2. **Validación en Tiempo Real:** Verificación de disponibilidad al momento de confirmar para evitar *double-booking*.
  3. Captura de correo de Gmail para recordatorios.

### D. Notificaciones y Recordatorios
- **Google Calendar:** Creación automática del evento en el calendario del profesional y del usuario.
- **Recordatorios por Email:** 
  - Envío automático un día antes de la cita.
  - Envío automático dos horas antes de la cita.

## 3. Requisitos de Diseño (UI/UX)
- **Mobile First:** Optimización extrema para smartphones.
- **Estética:** Minimalista, moderna y clara.
- **Modo Dual:** Soporte nativo para Modo Claro (Light Mode) y Modo Oscuro (Dark Mode).
- **Consistencia:** Uso de variables semánticas de color y tipografía moderna (Inter/Outfit).

## 4. Stack Tecnológico (Propuesto)
- **Framework:** Next.js (App Router).
- **Estilos:** Tailwind CSS con configuración para modo claro/oscuro.
- **Base de Datos:** Prisma (conectado a la DB de preferencia).
- **Gestor de Paquetes:** pnpm.
- **Integraciones:** 
  - Google Calendar API.
  - API de WhatsApp (Twilio u otra similar para OTP).
  - Resend (para recordatorios por email).

---
*Documento generado para guiar el desarrollo inicial del proyecto VLink.*
