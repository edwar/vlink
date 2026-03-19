"use client"

import { useState } from "react"
import { setupWompiSubaccount } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle, Landmark, IdCard, User, Mail, Phone, Save } from "lucide-react"
import { sileo } from "sileo"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

const COLOMBIAN_BANKS = [
    { code: "1507", name: "Nequi" },
    { code: "1551", name: "Daviplata" },
    { code: "007", name: "Bancolombia" },
    { code: "051", name: "Davivienda" },
    { code: "001", name: "Banco de Bogotá" },
    { code: "013", name: "BBVA Colombia" },
    { code: "006", name: "Banco de Occidente" },
    { code: "057", name: "Banco Caja Social" },
    { code: "019", name: "Lulo Bank" },
    { code: "0151", name: "RappiPay" },
    { code: "002", name: "Banco Popular" },
    { code: "012", name: "Banco GNB Sudameris" },
    { code: "052", name: "Banco AV Villas" },
    { code: "058", name: "Banco Procrédito" },
]

export function WompiSubaccountForm({ organizationId, onCreated }: { organizationId: string, onCreated: (id: string) => void }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [selectedBank, setSelectedBank] = useState<string>("")

    const isDigitalWallet = selectedBank === "1507" || selectedBank === "1551"

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        try {
            const data = {
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                phone: formData.get("phone") as string,
                documentType: formData.get("documentType") as any,
                documentNumber: formData.get("documentNumber") as string,
                accountType: formData.get("accountType") as any,
                accountNumber: formData.get("accountNumber") as string,
                bankCode: formData.get("bankCode") as string,
            }

            const result = await setupWompiSubaccount(organizationId, data)
            if (result.success) {
                sileo.success({
                    title: "Subcuenta Creada",
                    description: `Se ha vinculado la subcuenta ${result.subaccountId} exitosamente.`
                })
                onCreated(result.subaccountId.toString())
                setOpen(false)
            }
        } catch (error: any) {
            console.error(error)
            sileo.error({
                title: "Error de creación",
                description: error.message || "No se pudo crear la subcuenta en Wompi."
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-primary/40 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] gap-2">
                    <PlusCircle className="h-4 w-4" /> Crear Nueva Subcuenta
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-lg p-8 border-border/40 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Landmark className="h-6 w-6" />
                        </div>
                        Datos Bancarios
                    </DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground pt-2">
                        Configura la cuenta para recibir pagos directos a través de Wompi.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Legal</Label>
                            <div className="relative">
                                <Input name="name" required placeholder="Ej: Juan Pérez o Mi Negocio SAS" className="h-12 rounded-xl pl-10 text-sm font-bold" />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Notificaciones</Label>
                            <div className="relative">
                                <Input name="email" type="email" required placeholder="pagos@ejemplo.com" className="h-12 rounded-xl pl-10 text-sm font-bold" />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo Documento</Label>
                            <Select name="documentType" defaultValue="CC">
                                <SelectTrigger className="h-12 rounded-xl text-sm font-bold bg-muted/20 border-none shadow-none">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                    <SelectItem value="NIT">NIT</SelectItem>
                                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                    <SelectItem value="PP">Pasaporte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Número Documento</Label>
                            <div className="relative">
                                <Input name="documentNumber" required placeholder="Sin puntos ni guiones" className="h-12 rounded-xl pl-10 text-sm font-bold" />
                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Banco</Label>
                        <Select name="bankCode" required onValueChange={setSelectedBank}>
                            <SelectTrigger className="h-12 rounded-xl text-sm font-bold bg-muted/20 border-none shadow-none">
                                <SelectValue placeholder="Selecciona tu banco" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-60">
                                {COLOMBIAN_BANKS.map(bank => (
                                    <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!isDigitalWallet ? (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Cuenta</Label>
                                <Select name="accountType" defaultValue="SAVINGS">
                                    <SelectTrigger className="h-12 rounded-xl text-sm font-bold bg-muted/20 border-none shadow-none">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="SAVINGS">Ahorros</SelectItem>
                                        <SelectItem value="CHECKING">Corriente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <input type="hidden" name="accountType" value="SAVINGS" />
                        )}
                        <div className={cn("space-y-2", isDigitalWallet && "md:col-span-2")}>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {isDigitalWallet ? "Número de Celular" : "Número de Cuenta"}
                            </Label>
                            <Input
                                name="accountNumber"
                                required
                                type={isDigitalWallet ? "tel" : "text"}
                                placeholder={isDigitalWallet ? "3000000000" : "Número de cuenta bancaria"}
                                className="h-12 rounded-xl text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Celular de Contacto</Label>
                        <div className="relative">
                            <Input name="phone" required placeholder="300 000 0000" className="h-12 rounded-xl pl-10 text-sm font-bold" />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/10 mt-4"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Creando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Guardar y Vincular
                            </>
                        )}
                    </Button>
                    <p className="text-[9px] text-muted-foreground font-medium text-center italic">
                        * Al guardar, los datos serán enviados a Wompi para su validación.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    )
}
