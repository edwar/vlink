"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createOrganization } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Building2, Rocket } from "lucide-react"

export function CreateOrganization() {
    const [name, setName] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsPending(true)
        setError(null)
        try {
            const result = await createOrganization(name.trim())
            if (result.success) {
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || "No se pudo crear la organización.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto border-2 shadow-xl animate-in fade-in zoom-in duration-500">
            <CardHeader className="text-center space-y-1">
                <div className="mx-auto bg-primary/10 p-4 rounded-3xl w-fit mb-4">
                    <Building2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display font-black tracking-tight">Crea tu Organización</CardTitle>
                <CardDescription className="text-base font-medium">
                    Centraliza la gestión de agendas para tu equipo o empresa.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Nombre de la empresa/asociación
                        </Label>
                        <Input
                            id="org-name"
                            placeholder="Ej: Clínica Dental VLink"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-14 text-lg border-2 focus:border-primary rounded-xl transition-all"
                            disabled={isPending}
                            autoFocus
                        />
                    </div>
                    {error && (
                        <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in slide-in-from-top-2">
                            {error}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="pt-4 pb-8">
                    <Button
                        type="submit"
                        className="w-full h-14 text-xl font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        disabled={isPending || !name.trim()}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-5 w-5" />
                                Empezar ahora
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
