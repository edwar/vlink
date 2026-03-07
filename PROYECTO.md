# Definición de Alcance y Objetivos - Proyecto VLink

VLink es una plataforma de gestión de citas diseñada para facilitar la programación de citas entre profesionales y sus usuarios finales. Ofrece una profunda integración con Google Calendar y un sistema de validación seguro.

## 1. Objetivos Principales (Completados)
- Proporcionar una herramienta de agendamiento eficiente, intuitiva y minimalista.
- Automatizar al 100% la sincronización bidireccional de citas con Google Calendar (incluyendo creación y cancelación de eventos).
- Simplificar el acceso de los clientes mediante captura de correo y WhatsApp, sin necesidad de crear una cuenta.
- Proveer paneles de administración avanzados para el profesional (gestión de disponibilidad, catálogo de servicios y monitoreo de agenda).
- Ofrecer una experiencia visual premium, priorizando dispositivos móviles (Mobile First).

## 2. Alcance del Proyecto Actualmente Implementado

### A. Autenticación y Perfil (Profesionales)
- **Login Seguro:** Acceso obligatorio seguro mediante Google OAuth, desarrollado sobre `better-auth`.
- **Permisos "Offline":** Conexión persistente mediante *refresh-tokens* para manipular calendarios sin que el usuario esté activo.
- **Link Único Público:** Cada profesional posee una URL personalizada y dinámica (ej: `vlink.cognilab.dev/nombre-usuario`) que lista sus servicios y horarios disponibles para compartir con sus clientes.
- **Onboarding Automático:** Creación de perfil y enlace de reservas automático al momento de iniciar sesión por primera vez.

### B. Gestión de Agenda (Panel de Control - Dashboard)
- **Gestión de Servicios:** Creación, edición, eliminación y ajuste de precios de servicios. Duraciones personalizadas que delimitan matemáticamente el calendario.
- **Resumen Estadístico:** Visualización en tarjetas de citas de hoy, ingresos esperados y próximos clientes.
- **Vista de Citas:** Lista de citas confirmadas y canceladas.
- **Bloqueos Recurrentes:** Configuración predeterminada de los horarios semanales del profesional.
- **Bloqueos Puntuales (Vacaciones/Permisos):** Capacidad para elegir un día en específico e inhabilitar los turnos de manera total o parcial.
- **Cancelación:** Posibilidad de cancelar citas desde el administrador, replicando al mismo tiempo la cancelación en Google Calendar.

### C. Sistema de Agendamiento (Usuarios Finales)
- **Catálogo de Servicios:** Pantalla inicial que permite escoger el tipo de cita, enseñando su precio y su duración si hubiese más de uno habilitado.
- **Selección Inteligente:** Calendario adaptativo de 14 días que esconde u oculta *slots* en tiempo real según los bloqueos, duraciones del servicio, o superposición de otras citas empleando zonas horarias en UTC-5 (Colombia).
- **Entrada de Datos de Contacto:** Captura de correo y número de WhatsApp con un sistema avanzado de formateado estético automático (`300 000 0000`).
- **Prevención Over-booking:** Re-verificación atómica al instante del guardado para asegurar que no existan empalmes en la base de datos.

### D. Notificaciones y Sincronización
- **Eventos en Google Calendar:** Transacción asíncrona ("Serverless friendly") para escribir detalles completos (Nombre, Correo y WhatsApp del cliente, Nombre del servicio) en la agenda de Google. Si la cita cae, Google notificará también por ese medio al invitado.
- **Confirmaciones por Email:** Envío automático e inmediato de correos personalizados al cliente dictando los detalles del turno, hora y el nombre del profesional a través de Resend tras hacer su reserva.

## 3. Requisitos de Diseño (UI/UX)
- **Mobile First Extremo:** Uso de modales y drawers nativos, fondos de navegación tipo cristal, *overlays* y animaciones (`animate-in` de Tailwind).
- **Modos Visuales:** Sistema robusto y testeado de Light Mode / Dark Mode controlable por el usuario con el componente ThemeToggle.
- **Open Graph Dinámicos:** Generación de tarjetas de vista previa renderizadas con Next.js Edge (OG Images) en `/opengraph-image`, mostrando la imagen insignia cuando el enlace se envía por chats de texto (WhatsApp, Twitter).
- **Microinteracciones y Feedback:** Estados vacíos amoldables (`EmptyState`), *Loaders* integrados en los botones durante submits, formateos instantáneos y Alertas tipo Toast (con `sileo`).

## 4. Stack Tecnológico (Implementado)
- **Framework:** Next.js (App Router, Server Actions, Server Components).
- **Estilos:** Tailwind CSS v4 con variables CSS nativas, clase `dark`, y pre-generadores (Lucide y SVG). `shadcn/ui` y Radix UI para componentes base.
- **Base de Datos:** PostgresSQL alojado en NeonDB.
- **ORM:** Prisma Studio y Client.
- **Autenticación:** Better-Auth con el adaptador de Prisma (Soporte OAuth de Google).
- **Comunicaciones:** Resend para envío de Emails (Formatos React-Email y HTML).
- **Infraestructura Cloud:** Vercel (Optimizaciones orientadas al modelo de funciones Serverless y Edge). Integración API de GCP (Google Calendar).

## 5. Gestión Organizacional y Multicuenta (En Desarrollo)

VLink evolucionará de una herramienta individual a una plataforma de gestión para equipos y organizaciones, permitiendo que gestores o administradores manejen múltiples agendas de forma centralizada.

### A. Modelo de Organizaciones y Roles
- **Estructura Escalable:** Implementación de tablas `Organization` y `Member` para agrupar profesionales bajo una misma entidad (empresa, clínica, asociación).
- **Sistema de Roles (RBAC):**
  - **OWNER/ADMIN:** Control total de la organización y facturación.
  - **MANAGER (Gestor):** Capacidad para visualizar, editar y coordinar las agendas de los profesionales asignados.
  - **PROFESSIONAL:** Dueño de la agenda sincronizada con Google.
- **Permisos Delegados:** Los gestores podrán actuar en nombre del profesional (crear servicios, bloquear horarios, cancelar citas) utilizando la conexión "offline" ya establecida con Google.

### B. Flujo de Conexión "Minimal Click"
Para garantizar la facilidad de uso y rapidez en la implementación:
- **Invitación por Enlace:** El gestor genera un enlace único de invitación para la organización.
- **Onboarding Flash:** El profesional abre el enlace, inicia sesión con Google y, en un solo paso, autoriza la gestión de su agenda y la sincronización del calendario.
- **Dashboard Multicuenta:** Los gestores contarán con un "Switcher" de perfiles para alternar entre agendas sin cerrar sesión, permitiendo una coordinación fluida de múltiples profesionales.

### C. Beneficios para el Negocio
- **Centralización:** Ideal para secretarios/as o asistentes que gestionan la agenda de varios doctores, abogados o consultores.
- **Privacidad Segura:** El profesional mantiene el control de su cuenta personal de Google, delegando solo la gestión operativa dentro de VLink.
- **Escalabilidad Horizontal:** Permite que VLink sea adoptado por empresas con decenas de empleados con una fricción de configuración casi nula.

## 6. Oportunidades de Mejora Identificadas

### 🔥 Alta Prioridad (Alto Impacto, Bajo Esfuerzo)

#### A. Recordatorios Automáticos por Email
La función `sendAppointmentEmail` ya soporta los tipos `REMINDER_24H` y `REMINDER_2H`, pero actualmente no hay ningún mecanismo que los dispare. Implementar un endpoint `/api/reminders/cron` invocado por Vercel Cron cada hora para buscar citas próximas completaría esta funcionalidad sin esfuerzo significativo.

#### B. Email de Cancelación al Cliente
Cuando el profesional cancela una cita, el cliente no recibe notificación alguna por email. Agregar un tipo `CANCELLATION` a la función de email y llamarla dentro de `cancelAppointmentAction` es un cambio menor de alto valor.

#### C. Reprogramación de Citas
Actualmente solo existe la opción de cancelar. Un flujo de reprogramación que permita al profesional mover una cita a otra fecha/hora disponible mejoraría significativamente la experiencia operativa, sin requerir cambios en el modelo de datos.

### 🚀 Media Prioridad (Alto Impacto, Esfuerzo Medio)

#### D. Link de Auto-Cancelación para Clientes
El cliente actualmente no puede cancelar su propia cita sin contactar al profesional. Incluir un token hash único en el email de confirmación que dirija a `/cancelar/[token]` resolvería esto de forma segura y sin requerir login.

#### E. Notas Internas en Citas
Agregar un campo `notes` al modelo `Appointment` para que el profesional pueda registrar el motivo de consulta, antecedentes o cualquier nota operativa privada. Alta utilidad en clínicas, consultorios y despachos.

#### F. Vista Consolidada de Disponibilidad por Organización
La página pública de la organización ya lista los perfiles, pero el cliente debe ingresar a cada uno individualmente para consultar disponibilidad. Un componente de disponibilidad unificada elevaría enormemente la utilidad de la vista organizacional.

### 💡 Menor Prioridad (Impacto Medio, Esfuerzo Mayor)

#### G. Sincronización Bidireccional con Google Calendar (Webhooks)
VLink actualmente escribe en Google Calendar pero no escucha cambios externos. Si el profesional bloquea tiempo directamente en su Google Calendar, VLink no se entera. La API de Google Calendar soporta push notifications para sincronización verdaderamente bidireccional.

#### H. Exportación de Historial a CSV
Un botón "Exportar" en el dashboard que genere un archivo CSV con las citas del período seleccionado, útil para reportes contables y seguimiento de ingresos.

- **Planes de Suscripción Recurrentes (SaaS):** Implementación de niveles de membresía para organizaciones integrados con **Mercado Pago**.
  - **Plan Gratuito:** 1 solo perfil/miembro.
  - **Plan Equipos:** Hasta 5 colaboradores con panel compartido.
  - **Plan Corporativo:** Colaboradores ilimitados y soporte prioritario.
  - Sistema de Webhooks y Billing Dashboard dedicado.

---
*Documento vivo de arquitectura y entregables. Refleja fielmente el estado avanzado y el nuevo horizonte de VLink.*
