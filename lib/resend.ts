import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

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
    type: 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_2H';
    clientName: string;
    professionalName: string;
    serviceName?: string;
    price?: number | null;
    date: string;
    time: string;
}) {
    const subjects = {
        CONFIRMATION: `Cita confirmada con ${professionalName}`,
        REMINDER_24H: `Recordatorio: Tienes una cita mañana con ${professionalName}`,
        REMINDER_2H: `Recordatorio: Tu cita con ${professionalName} es en 2 horas`,
    };

    const formattedPrice = price !== undefined && price !== null
        ? `$ ${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
        : null;

    try {
        await resend.emails.send({
            from: 'VLink <hola@cognilab.dev>', // Assuming verified domain or testing with resend email
            to,
            subject: subjects[type],
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - ${subjects[type]}</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">Tu cita con <strong>${professionalName}</strong> está programada para:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${serviceName ? `<p style="margin: 0; color: #0f172a;"><strong>Servicio:</strong> ${serviceName}</p>` : ''}
            ${formattedPrice ? `<p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Precio:</strong> ${formattedPrice}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin: 5px 0 0 0; color: #0f172a;"><strong>Hora:</strong> ${time}</p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 30px;">Si necesitas cancelar o reprogramar, por favor contacta al profesional directamente.</p>
        </div>
      `,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export async function sendOTPEmail({
    to,
    clientName,
    code,
}: {
    to: string;
    clientName: string;
    code: string;
}) {
    try {
        const response = await resend.emails.send({
            from: 'VLink <hola@cognilab.dev>',
            to,
            subject: 'Tu código de verificación - VLink',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - Verificación</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">Usa el siguiente código para continuar con tu reserva:</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: 4px; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; cursor: pointer;">${code}</p>
            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500;">(Toca el código para seleccionarlo fácilmente)</p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 30px;">Este código expirará en 15 minutos.</p>
        </div>
      `,
        });
        console.log("Resend sending OTP response:", response);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
}
