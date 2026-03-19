import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentEmail({
  to,
  type,
  clientName,
  professionalName,
  serviceName,
  price,
  date,
  time,
  cancelLink,
}: {
  to: string;
  type: 'CONFIRMATION' | 'CANCELLATION' | 'RESCHEDULE' | 'REMINDER_24H' | 'REMINDER_2H';
  clientName: string;
  professionalName: string;
  serviceName?: string;
  price?: number | null;
  date: string;
  time: string;
  cancelLink?: string;
}) {
  const subjects = {
    CONFIRMATION: `Cita confirmada con ${professionalName}`,
    CANCELLATION: `Tu cita con ${professionalName} ha sido cancelada`,
    RESCHEDULE: `Tu cita con ${professionalName} ha sido reprogramada`,
    REMINDER_24H: `Recordatorio: Tienes una cita mañana con ${professionalName}`,
    REMINDER_2H: `Recordatorio: Tu cita con ${professionalName} es en 2 horas`,
  };

  const isCancellation = type === 'CANCELLATION'
  const isReschedule = type === 'RESCHEDULE'

  const formattedPrice = price !== undefined && price !== null
    ? `$ ${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
    : null;

  try {
    await resend.emails.send({
      from: 'VLink <hola@cognilab.dev>', // Assuming verified domain or testing with resend email
      to,
      subject: subjects[type],
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid ${isCancellation ? '#fee2e2' : '#e2e8f0'}; border-radius: 12px;">
          <h1 style="color: ${isCancellation ? '#dc2626' : '#0f172a'}; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - ${subjects[type]}</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">${isCancellation ? `Lamentamos informarte que tu cita con <strong>${professionalName}</strong> ha sido cancelada.` : isReschedule ? `Tu cita con <strong>${professionalName}</strong> ha sido reprogramada a:` : `Tu cita con <strong>${professionalName}</strong> está programada para:`}</p>
          <div style="background-color: ${isCancellation ? '#fef2f2' : '#f8fafc'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${serviceName ? `<p style="margin: 0; color: #0f172a;"><strong>Servicio:</strong> ${serviceName}</p>` : ''}
            ${formattedPrice ? `<p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Precio:</strong> ${formattedPrice}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Hora:</strong> ${time}</p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 30px;">${isCancellation ? 'Si tienes alguna pregunta o deseas agendar una nueva cita, por favor contacta al profesional directamente.' : 'Si necesitas cancelar o reprogramar, por favor contacta al profesional directamente.'}</p>
          ${cancelLink && type === 'CONFIRMATION' ? `
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 12px 0;">¿Necesitas cancelar? Tienes hasta 2 horas antes de tu cita.</p>
            <a href="${cancelLink}" style="display: inline-block; background-color: #fee2e2; color: #dc2626; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; text-decoration: none;">Cancelar mi cita</a>
          </div>` : ''}
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendSubscriptionEmail({
  to,
  organizationName,
  type,
  planName,
  gracePeriodEnd
}: {
  to: string;
  organizationName: string;
  type: 'GRACE_PERIOD' | 'DEGRADED' | 'PAYMENT_FAILED';
  planName: string;
  gracePeriodEnd?: string;
}) {
  const subjects = {
    GRACE_PERIOD: `⚠️ Problema con tu suscripción de ${organizationName}`,
    DEGRADED: `Plan degradado a BASIC - ${organizationName}`,
    PAYMENT_FAILED: `Error en el pago recurrente de ${organizationName}`,
  };

  const colors = {
    GRACE_PERIOD: '#f59e0b', // Amber
    DEGRADED: '#ef4444', // Red
    PAYMENT_FAILED: '#ef4444', // Red
  };

  try {
    await resend.emails.send({
      from: 'VLink Billing <billing@cognilab.dev>',
      to,
      subject: subjects[type],
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: ${colors[type]}; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - ${subjects[type]}</h1>
          <p style="color: #475569; font-size: 16px;">Hola,</p>
          <p style="color: #475569; font-size: 16px;">
            ${type === 'GRACE_PERIOD'
          ? `Hemos tenido un problema al procesar el pago de tu plan <strong>${planName}</strong> para la organización <strong>${organizationName}</strong>. Tienes hasta el <strong>${gracePeriodEnd}</strong> (7 días de gracia) para actualizar tus datos de pago antes de que el plan sea degradado.`
          : type === 'DEGRADED'
            ? `Lamentamos informarte que el periodo de gracia ha terminado y tu organización <strong>${organizationName}</strong> ha sido degradada automáticamente al plan <strong>BASIC</strong>.`
            : `No hemos podido procesar tu pago recurrente. Por favor, revisa tus medios de pago en la sección de administración.`}
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organizacion/planes" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none;">Gestionar Suscripción</a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending subscription email:', error);
  }
}

export async function sendPaymentEmail({
  to,
  clientName,
  professionalName,
  serviceName,
  price,
  date,
  time,
  qrImage,
  paymentUrl,
}: {
  to: string;
  clientName: string;
  professionalName: string;
  serviceName?: string;
  price?: number | null;
  date: string;
  time: string;
  qrImage?: string | null;
  paymentUrl?: string | null;
}) {
  const formattedPrice = price !== undefined && price !== null
    ? `$ ${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
    : null;

  try {
    await resend.emails.send({
      from: 'VLink <hola@cognilab.dev>',
      to,
      subject: `Pago requerido para confirmar tu cita con ${professionalName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - Pago Pendiente</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">Para confirmar tu cita con <strong>${professionalName}</strong> es necesario realizar el pago.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${serviceName ? `<p style="margin: 0; color: #0f172a;"><strong>Servicio:</strong> ${serviceName}</p>` : ''}
            ${formattedPrice ? `<p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Precio a Pagar:</strong> ${formattedPrice}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Hora:</strong> ${time}</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            ${qrImage ? `<p style="color: #475569; font-size: 14px; margin-bottom: 10px;">Escanea este QR con Bancolombia o Nequi:</p><img src="${qrImage}" alt="QR de Pago Wompi" style="max-width: 250px; border-radius: 12px; border: 1px solid #e2e8f0; display: block; margin: 0 auto 20px auto;" />` : ''}
            ${paymentUrl ? `<a href="${paymentUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none;">Ir a pagar</a>` : ''}
          </div>

          <p style="color: #475569; font-size: 14px; margin-top: 30px;">Una vez que el pago sea detectado, recibirás el correo de confirmación de tu cita.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending payment email:', error);
  }
}
