"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { createLocation, updateLocation } from "@/app/actions/locations"
import { sileo } from "sileo"
import { useRouter } from "next/navigation"
import { DialogClose } from "@/components/ui/dialog"

const locationSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

interface LocationFormProps {
    organizationId: string
    initialData?: {
        id: string
        name: string
        address: string | null
        city: string | null
        phone: string | null
    }
    onSuccess?: () => void
}

export function LocationForm({ organizationId, initialData, onSuccess }: LocationFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            name: initialData?.name || "",
            address: initialData?.address || "",
            city: initialData?.city || "",
            phone: initialData?.phone || "",
        },
    })

    async function onSubmit(values: LocationFormValues) {
        setLoading(true)
        try {
            if (initialData) {
                await updateLocation(initialData.id, values)
                sileo.success({ title: "Sede actualizada", description: "La sede se ha actualizado correctamente" })
            } else {
                await createLocation(organizationId, values)
                sileo.success({ title: "Sede creada", description: "La sede se ha creado correctamente" })
            }
            onSuccess?.()
            if (!initialData) form.reset()
            document.getElementById('close-dialog-btn')?.click()
            router.refresh()
        } catch (error: any) {
            sileo.error({ title: "Error", description: error.message || "Ocurrió un error al guardar la sede" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Nombre de la Sede</FormLabel>
                            <FormControl>
<Input placeholder="Ej: Sede Norte, Consultorio Central..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Ciudad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Bogotá" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Teléfono</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Opcional (Ej. 300 000 0000)"
                                        {...field}
                                        onChange={(e) => {
                                            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                                            if (x) {
                                                field.onChange(!x[2] ? x[1] : `${x[1]} ${x[2]}` + (x[3] ? ` ${x[3]}` : ''));
                                            } else {
                                                field.onChange(e.target.value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Dirección</FormLabel>
                            <FormControl>
                                <Input placeholder="Calle 123 # 45 - 67" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-black uppercase tracking-widest mt-4">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Actualizar Sede" : loading ? "Creando Sede..." : "Crear Sede"}
                </Button>
                <DialogClose asChild>
                    <button type="button" id="close-dialog-btn" className="hidden" aria-hidden="true" />
                </DialogClose>
            </form>
        </Form>
    )
}
