import fs from "fs"
import path from "path"
import { ManualClientWrapper } from "@/components/manual-client-wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "VLink | Guía Maestra de Usuario",
    description: "Manual completo para el uso de la plataforma VLink. Aprende a gestionar tus citas, profesionales y pagos sin esfuerzo.",
    openGraph: {
        title: "Guía Maestra de Usuario: VLink",
        description: "Domina VLink con nuestra guía completa de gestión profesional.",
        images: ["/images/manual/vlink_hero.png"]
    }
}

export default async function ManualPage() {
    const manualPath = path.join(process.cwd(), "MANUAL_USUARIO.md")
    const content = fs.readFileSync(manualPath, "utf-8")

    return (
        <div className="min-h-screen bg-background">
            <ManualClientWrapper content={content} />
        </div>
    )
}
