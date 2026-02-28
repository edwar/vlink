# Definición de Alcance y Objetivos - Proyecto VLink

VLink es una plataforma de gestión de citas diseñada para facilitar la programación de citas entre profesionales y sus usuarios finales. Ofrece una profunda integración con Google Calendar y un sistema de validación seguro.

## 1. Objetivos Principales (Completados)
- Proporcionar una herramienta de agendamiento eficiente, intuitiva y minimalista.
- Automatizar al 100% la sincronización bidireccional de citas con Google Calendar (incluyendo creación y cancelación de eventos).
- Simplificar el acceso de los clientes mediante validación por correo electrónico (OTP) evitando tener que usar contraseñas.
- Proveer paneles de administración avanzados para el profesional (gestión de disponibilidad, catálogo de servicios y monitoreo de agenda).
- Ofrecer una experiencia visual premium, priorizando dispositivos móviles (Mobile First).

## 2. Alcance del Proyecto Actualmente Implementado

### A. Autenticación y Perfil (Profesionales)
- **Login Seguro:** Acceso obligatorio seguro mediante Google OAuth, desarrollado sobre `better-auth`.
- **Permisos "Offline":** Conexión persistente mediante *refresh-tokens* para manipular calendarios sin que el usuario esté activo.
- **Link Único Público:** Cada profesional posee una URL personalizada y dinámica (ej: `vlink.app/nombre-usuario`) que lista sus servicios y horarios disponibles para compartir con sus clientes.
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
- **Flujo de Seguridad OTP (One Time Password):**
  1. El usuario entrega su Email y Nombre.
  2. VLink verifica empleando Resend un código numérico temporal enviado al correo para validar la identidad.
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

## 5. Próximo Alcance: Gestión Organizacional y Multicuenta (En Desarrollo)

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

---
*Documento vivo de arquitectura y entregables. Refleja fielmente el estado avanzado y el nuevo horizonte de VLink.*
