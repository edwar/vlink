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
- **Notas Internas:** Campo `notes` en las citas para que el profesional registre información privada del cliente o la sesión.
- **Exportación de Datos:** Botón para exportar el historial de citas a formato CSV para reportes externos.

### C. Sistema de Agendamiento (Usuarios Finales)
- **Catálogo de Servicios:** Pantalla inicial que permite escoger el tipo de cita, enseñando su precio y su duración si hubiese más de uno habilitado.
- **Selección Inteligente:** Calendario adaptativo de 14 días que esconde u oculta *slots* en tiempo real según los bloqueos, duraciones del servicio, o superposición de otras citas empleando zonas horarias en UTC-5 (Colombia).
- **Entrada de Datos de Contacto:** Captura de correo y número de WhatsApp con un sistema avanzado de formateado estético automático (`300 000 0000`).
- **Prevención Over-booking:** Re-verificación atómica al instante del guardado para asegurar que no existan empalmes en la base de datos.

### D. Notificaciones y Sincronización
- **Eventos en Google Calendar:** Transacción asíncrona ("Serverless friendly") para escribir detalles completos (Nombre, Correo y WhatsApp del cliente, Nombre del servicio) en la agenda de Google.
- **Confirmaciones por Email:** Envío automático e inmediato de correos personalizados al cliente a través de Resend.
- **Recordatorios Automáticos:** Sistema integrado con Vercel Cron que envía avisos por email 24h y 2h antes de cada cita.
- **Auto-Cancelación:** Los clientes pueden cancelar su propia cita a través de un enlace seguro con token hash incluido en su correo de confirmación.

## 3. Requisitos de Diseño (UI/UX)
- **Mobile First Extremo:** Uso de modales y drawers nativos, fondos de navegación tipo cristal y animaciones fluidas.
- **Interfaz Liviana y Plana:** Evitar la anidación de cajas (cajas dentro de cajas) ya que afecta negativamente el diseño en dispositivos móviles. Preferir un diseño sin bordes gruesos ni sombras pronunciadas para lograr un aspecto más limpio y minimalista.
- **Diferenciación de Secciones:** Cada sección puede contar con un degradado sutil para destacar visualmente (ej. `bg-linear-to-br`), pero este debe aplicarse directamente sobre el contenedor principal, evitando anidar otra caja visible dentro de este (cero fondos dobles).
- **Skeleton Loaders:** Implementación de placeholders animados durante la carga de componentes asíncronos (como el switcher de perfiles) para eliminar el Layout Shift (CLS).
- **Modos Visuales:** Soporte completo de Light/Dark Mode con persistencia.
- **Open Graph Dinámicos:** Generación dinámica de tarjetas de vista previa para redes sociales y chats.
- **Microinteracciones y Feedback:** Estados vacíos amoldables (`EmptyState`), *Loaders* integrados en los botones durante submits, formateos instantáneos y Alertas tipo Toast.

## 4. Stack Tecnológico (Implementado)
- **Framework:** Next.js (App Router, Server Actions, Server Components).
- **Estilos:** Tailwind CSS v4 con variables CSS nativas, clase `dark`, y pre-generadores (Lucide y SVG). `shadcn/ui` y Radix UI para componentes base.
- **Base de Datos:** PostgresSQL alojado en NeonDB.
- **ORM:** Prisma Studio y Client.
- **Autenticación:** Better-Auth con el adaptador de Prisma (Soporte OAuth de Google).
- **Comunicaciones:** Resend para envío de Emails (Formatos React-Email y HTML).
- **Infraestructura Cloud:** Vercel (Optimizaciones orientadas al modelo de funciones Serverless y Edge). Integración API de GCP (Google Calendar).

## 5. Gestión Organizacional y Multicuenta

### A. Modelo de Organizaciones y Roles (Implementado)
- **Estructura Escalable:** Tablas `Organization` y `Member` para agrupar profesionales.
- **Sistema de Roles (RBAC):** OWNER, MANAGER y PROFESSIONAL.
- **Dashboard Multicuenta:** Switcher de perfiles para que administradores gestionen múltiples agendas fluidamente.

### B. Políticas de Facturación y Límites (Nueva Política)
- **Límites de Miembros:** Restricción automática de visibilidad y acceso basado en el plan contratado (BASIC, TEAM, CORPORATE).
- **Degradación con Periodo de Gracia:**
  - En caso de fallo en el pago recurrente, el sistema otorga una **semana de gracia** (7 días) antes de aplicar restricciones.
  - Al cumplirse el plazo, la organización se degrada automáticamente al plan **BASIC**.
  - **Notificación:** Envío automático de correo al propietario informando sobre la degradación y los pasos para reactivar el servicio.
- **Soft-Lock de Miembros:** Al degradar a un plan inferior, los miembros excedentes se ocultan automáticamente de la página pública y se inhabilitan para recibir citas nuevas, protegiendo sus datos históricos.

## 6. Oportunidades de Mejora Identificadas (Próximos Pasos)
- **Reprogramación de Citas:** Flujo para permitir al profesional mover una cita a otra fecha/hora disponible.
- **Sincronización Bidireccional Completa:** Integración de Webhooks de Google Calendar para escuchar bloqueos realizados directamente en la app de Google.
- **Vista Unificada de Disponibilidad:** Página organizacional que agrupe todos los horarios del equipo en un solo calendario consolidado.

## 7. Módulo de Administración de Plataforma (VLink Admin)

### A. Dashboard Global de Métricas (Implementado)
- **KPIs y Estadísticas:** Total de organizaciones, usuarios, citas y distribución de planes.
- **Análisis de Rendimiento:** Servicios más demandados y crecimiento mensual de registros.

### B. Gestión y Soporte (Implementado)
- **Directorio Maestro:** Control total de organizaciones y usuarios.
- **Modo Soporte:** Los administradores pueden unirse temporalmente a cualquier organización con rol de OWNER para resolver problemas técnicos o de facturación.
- **Editor de Planes:** Configuración dinámica de precios, límites técnicos (`maxSeats`) y características visibles.

### C. Configuración de Sistema (Implementado)
- **Anuncios Globales:** Banner dinámico en el dashboard para comunicaciones críticas (INFO, SUCCESS, WARNING).
- **Modo Mantenimiento:** Interruptor global para estados fuera de línea controlados.
- **Admin Empty States:** Interfaz pulida con estados vacíos consistentes en todas las tablas administrativas.

### D. Salud del Sistema y Conectividad (En Desarrollo)
- **Centro de Webhooks:** Monitoreo del estado de los webhooks de Google Calendar y notificaciones de Mercado Pago.
- **Logs de Auditoría:** Registro detallado de cambios críticos realizados por los administradores en el sistema.
- **Alertas de Errores:** Panel de errores recientes reportados por la infraestructura para detección temprana de fallos.

## 8. Integración de Pagos (Wompi QR Dinámico)

**Objetivo:** Implementar un flujo de backend que genere un QR Dinámico de Nequi/Wompi por cita, lo envíe por email y procese la confirmación automática vía Webhook.

### 1. Configuración y Seguridad (Variables de Entorno)
- Usa las llaves maestras globales: `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET`.
- Asume que cada `Organization` en la BD tiene un `wompi_subaccount_id` para dirigir el dinero al dueño del negocio.

### 2. Lógica de Generación (Endpoint/Función)
- **Firma de Integridad:** Antes de cada petición, genera el `integrity_signature` (SHA256) combinando: referencia, monto, moneda y el `INTEGRITY_SECRET`.
- **Petición a Wompi:** Crea una "Presolicitud de pago" que incluya el monto, la `subaccount_id` de la organización y una `referencia_unica` vinculada al ID de la cita.
- **QR Dinámico:** Extrae de la respuesta el string/imagen del QR Dinámico generado.

### 3. Comunicación (Email Service)
- Crea una función que dispare un correo al cliente con el QR Dinámico visible y un botón de "Ir a pagar".
- Indica que el pago es necesario para confirmar la reserva en el calendario del empleado.

### 4. Validación Automática (Webhook)
- Crea el endpoint `POST /api/webhooks/wompi` (ajustado de `/webhooks/wompi` para entorno App Router si aplica, o equivalente).
- **Validación de Origen:** Verifica el checksum del evento usando el `WOMPI_EVENTS_SECRET` para asegurar que la petición es de Wompi.
- **Actualización de Estado:** Si el evento es `transaction.updated` y el estado es `APPROVED`, busca la cita por su referencia y cámbiala a estado "PAGADA" en la base de datos.

### Restricciones Técnicas
- NO uses QRs estáticos ni validación manual de imágenes.
- La lógica debe ser agnóstica al empleado; el pago valida la Cita (Appointment).
- Código limpio y modular en Node.js (Next.js App Router).

### Lo que necesitas tener a mano para que esto funcione
Para que la implementación sea exitosa, asegúrate de registrarte en el Portal de Comercios de Wompi y obtener estos datos:
- **Credenciales de Prueba (Sandbox):** Usa estas primero para poder simular pagos sin dinero real.
- **Habilitar el Rol de Marketplace:** Debes solicitar a Wompi que tu cuenta sea "Maestra" para poder crear subcuentas a tus profesionales.
- **URL de Notificación:** Debes entrar al dashboard de Wompi y pegar la URL de tu webhook (ej. `https://tu-api.com/api/webhooks/wompi`) para que ellos sepan a dónde enviar los avisos de pago.

---
*Documento vivo de arquitectura y entregables. Refleja fielmente el estado avanzado y el nuevo horizonte de VLink.*
