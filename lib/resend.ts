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
}: {
    to: string;
    type: 'CONFIRMATION' | 'CANCELLATION' | 'REMINDER_24H' | 'REMINDER_2H';
    clientName: string;
    professionalName: string;
    serviceName?: string;
    price?: number | null;
    date: string;
    time: string;
}) {
    const subjects = {
        CONFIRMATION: `Cita confirmada con ${professionalName}`,
        CANCELLATION: `Tu cita con ${professionalName} ha sido cancelada`,
        REMINDER_24H: `Recordatorio: Tienes una cita mañana con ${professionalName}`,
        REMINDER_2H: `Recordatorio: Tu cita con ${professionalName} es en 2 horas`,
    };

    const isCancellation = type === 'CANCELLATION'

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
          <p style="color: #475569; font-size: 16px;">${isCancellation ? `Lamentamos informarte que tu cita con <strong>${professionalName}</strong> ha sido cancelada.` : `Tu cita con <strong>${professionalName}</strong> está programada para:`}</p>
          <div style="background-color: ${isCancellation ? '#fef2f2' : '#f8fafc'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${serviceName ? `<p style="margin: 0; color: #0f172a;"><strong>Servicio:</strong> ${serviceName}</p>` : ''}
            ${formattedPrice ? `<p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Precio:</strong> ${formattedPrice}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Hora:</strong> ${time}</p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 30px;">${isCancellation ? 'Si tienes alguna pregunta o deseas agendar una nueva cita, por favor contacta al profesional directamente.' : 'Si necesitas cancelar o reprogramar, por favor contacta al profesional directamente.'}</p>
        </div>
      `,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

