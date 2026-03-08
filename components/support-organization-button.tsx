"use client"

import { useState } from "react"
import { supportOrganization } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Headset, Loader2 } from "lucide-react"
import { sileo } from "sileo"
import { useRouter } from "next/navigation"

interface SupportOrganizationButtonProps {
    organizationId: string
    organizationName: string
    isAlreadyMember: boolean
}

export function SupportOrganizationButton({ organizationId, organizationName, isAlreadyMember }: SupportOrganizationButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSupport() {
        if (isAlreadyMember) {
            router.push("/dashboard/organizacion")
            return
        }

        setIsLoading(true)
        try {
            await supportOrganization(organizationId)
            sileo.success({
                title: "Acceso concedido",
                description: `Te has unido a ${organizationName} como OWNER para dar soporte.`
            })
            router.push("/dashboard/organizacion")
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "No se pudo acceder a la organización" })
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={isAlreadyMember ? "default" : "secondary"}
            size="sm"
            onClick={handleSupport}
            disabled={isLoading}
            className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest shadow-sm gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Headset className="h-4 w-4" />
            )}
            {isAlreadyMember ? "Ir al Dashboard" : "Dar Soporte"}
        </Button>
    )
}
