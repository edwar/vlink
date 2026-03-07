import { NextResponse } from "next/server"
import { getEffectiveProfile } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET() {
    try {
        const profile = await getEffectiveProfile()

        const appointments = await prisma.appointment.findMany({
            where: {
                profileId: profile.id
            },
            include: {
                service: true
            },
            orderBy: {
                startTime: 'desc'
            }
        })

        // CSV Header
        const headers = [
            "ID",
            "Servicio",
            "Cliente",
            "Email",
            "Teléfono",
            "Estado",
            "Fecha Inicio",
            "Fecha Fin",
            "Duración (Minutos)",
            "Notas Internas",
            "Fecha de Creación"
        ]

        // Escape CSV fields to prevent issues with commas or quotes
        const escapeCSV = (field: string | null | undefined) => {
            if (!field) return '""'
            const stringField = String(field)
            if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`
            }
            return stringField
        }

        const rows = appointments.map((appt) => {
            const durationMins = Math.round((appt.endTime.getTime() - appt.startTime.getTime()) / 60000)

            return [
                escapeCSV(appt.id),
                escapeCSV(appt.service?.name || "Eliminado"),
                escapeCSV(appt.clientName),
                escapeCSV(appt.clientEmail),
                escapeCSV(appt.clientPhone),
                escapeCSV(appt.status),
                escapeCSV(format(appt.startTime, "yyyy-MM-dd HH:mm:ss")),
                escapeCSV(format(appt.endTime, "yyyy-MM-dd HH:mm:ss")),
                escapeCSV(durationMins.toString()),
                escapeCSV(appt.notes),
                escapeCSV(format(appt.createdAt, "yyyy-MM-dd HH:mm:ss"))
            ].join(",")
        })

        const csvContent = [headers.join(","), ...rows].join("\n")

        // Return as a downloadable CSV file
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="historial_citas_${format(new Date(), "yyyyMMdd")}.csv"`
            }
        })

    } catch (error) {
        console.error("Export error:", error)
        return new NextResponse("Error al generar el archivo", { status: 500 })
    }
}
