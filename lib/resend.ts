import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentEmail({
    to,
    type,
    clientName,
    professionalName,
    date,
    time,
}: {
    to: string;
    type: 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_2H';
    clientName: string;
    professionalName: string;
    date: string;
    time: string;
}) {
    const subjects = {
        CONFIRMATION: `Cita confirmada con ${professionalName}`,
        REMINDER_24H: `Recordatorio: Tienes una cita mañana con ${professionalName}`,
        REMINDER_2H: `Recordatorio: Tu cita con ${professionalName} es en 2 horas`,
    };

    try {
        await resend.emails.send({
            from: 'VLink <noreply@vlink.app>', // Assuming verified domain or testing with resend email
            to,
            subject: subjects[type],
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - ${subjects[type]}</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">Tu cita con <strong>${professionalName}</strong> está programada para:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0f172a;"><strong>Fecha:</strong> ${date}</p>
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
        await resend.emails.send({
            from: 'VLink <noreply@vlink.app>',
            to,
            subject: 'Tu código de verificación - VLink',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">VLink - Verificación</h1>
          <p style="color: #475569; font-size: 16px;">Hola ${clientName},</p>
          <p style="color: #475569; font-size: 16px;">Usa el siguiente código para continuar con tu reserva:</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: 4px;">${code}</p>
          </div>
          <p style="color: #475569; font-size: 14px; margin-top: 30px;">Este código expirará en 15 minutos.</p>
        </div>
      `,
        });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
}
