import { NextRequest, NextResponse } from "next/server";
import { validateWompiEventSignature } from "@/lib/wompi";
import prisma from "@/lib/prisma";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { sendAppointmentEmail } from "@/lib/resend";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get("x-event-checksum");
        let timestamp = req.headers.get("x-event-timestamp");
        
        // Sometimes Wompi sends timestamp in body as well, but headers are safer if they provide them
        if (!timestamp && body.timestamp) {
            timestamp = body.timestamp.toString();
        }

        if (!signature || !timestamp || !validateWompiEventSignature(body, signature, timestamp)) {
            console.error("Wompi Webhook: Invalid signature or missing parameters");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { event, data } = body;

        if (event === "transaction.updated") {
            const tx = data.transaction;
            
            if (tx.status === "APPROVED") {
                const appointment = await prisma.appointment.findUnique({
                    where: { paymentReference: tx.reference },
                    include: {
                        profile: {
                            include: { 
                                user: {
                                    include: {
                                        memberships: {
                                            include: { organization: true }
                                        }
                                    }
                                }
                            }
                        },
                        service: true
                    }
                });

                if (!appointment) {
                    console.error(`Wompi Webhook: Appointment not found for reference ${tx.reference}`);
                    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
                }

                if (appointment.status === "PENDING") {
                    // Update the status to PAGADA (or CONFIRMED since we use CONFIRMED for active appointments)
                    // Depending on definitions, let's use "PAGADA" as explicitly requested.
                    const updatedAppointment = await prisma.appointment.update({
                        where: { id: appointment.id },
                        data: { status: "PAGADA" }
                    });

                    const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${appointment.cancelToken}`;
                    const professionalName = appointment.profile.user.name || appointment.profile.username;

                    const organization = (appointment.profile.user as any).memberships[0]?.organization;
                    const orgPhone = organization?.phone;
                    const orgWhatsapp = organization?.whatsapp;

                    // Send Confirmation email
                    await sendAppointmentEmail({
                        to: appointment.clientEmail || "",
                        type: "CONFIRMATION",
                        clientName: appointment.clientName,
                        professionalName,
                        serviceName: appointment.service?.name,
                        price: appointment.service?.price,
                        date: format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: es }),
                        time: format(appointment.startTime, "HH:mm"),
                        cancelLink,
                        phone: orgPhone,
                        whatsapp: orgWhatsapp
                    }).catch(console.error);

                    // Sync with Google Calendar
                    await createGoogleCalendarEvent(appointment.id).catch(console.error);
                }
            }
            // Add logic if status is VOIDED or DECLINED if needed:
            else if (tx.status === "DECLINED" || tx.status === "VOIDED" || tx.status === "ERROR") {
                const appointment = await prisma.appointment.findUnique({
                    where: { paymentReference: tx.reference }
                });

                if (appointment && appointment.status === "PENDING") {
                    await prisma.appointment.update({
                        where: { id: appointment.id },
                        data: { status: "CANCELLED", notes: "Pago rechazado o fallido en Wompi." }
                    });
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Wompi Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
