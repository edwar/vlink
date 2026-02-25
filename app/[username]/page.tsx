"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, MessageSquare, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailableSlots, createAppointment } from "@/app/actions/booking"

export default function BookingPage({ params }: { params: { username: string } }) {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [step, setStep] = useState(1) // 1: Select date/time, 2: WhatsApp OTP, 3: Success
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Fetch slots when date changes
    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true)
            try {
                const available = await getAvailableSlots(params.username, selectedDate)
                setSlots(available)
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedDate, params.username])

    // Next 14 days for date selection
    const days = [...Array(14)].map((_, i) => addDays(startOfToday(), i))

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            <main className="max-w-md mx-auto px-6 py-12 md:py-20 space-y-10">

                {/* Header Perfil */}
                <header className="text-center space-y-4">
                    <div className="h-20 w-20 bg-accent rounded-full mx-auto flex items-center justify-center text-2xl font-bold border-2 border-primary/10">
                        {params.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold">Reserva con @{params.username}</h1>
                        <p className="text-muted-foreground text-sm">Escoge el mejor momento para nuestra cita.</p>
                    </div>
                </header>

                {step === 1 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Selector de Fecha */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <CalendarIcon className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">1. Selecciona el Día</h2>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                                {days.map((day) => (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "flex flex-col items-center min-w-[64px] p-4 rounded-2xl border-2 transition-all",
                                            isSameDay(day, selectedDate)
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-card border-transparent hover:border-accent"
                                        )}
                                    >
                                        <span className="text-[10px] uppercase font-bold opacity-70">
                                            {format(day, "eee", { locale: es })}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {format(day, "d")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Selector de Hora */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">2. Selecciona la Hora</h2>
                            </div>

                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border-2 border-dashed gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Buscando horarios...</p>
                                </div>
                            ) : slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {slots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "py-3 rounded-xl border-2 font-semibold text-sm transition-all",
                                                selectedTime === time
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                    : "bg-card border-transparent hover:border-accent"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-accent/30 rounded-2xl text-center border-2 border-dashed">
                                    <p className="text-sm text-muted-foreground italic">No hay horarios disponibles para este día.</p>
                                </div>
                            )}
                        </section>

                        {/* Botón Continuar */}
                        <button
                            disabled={!selectedTime}
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Continuar
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                ) : step === 2 ? (
                    <WhatsAppVerification
                        username={params.username}
                        onBack={() => setStep(1)}
                        onSuccess={() => setStep(3)}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                ) : (
                    <SuccessView
                        username={params.username}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                )}

            </main>
        </div>
    )
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
}

function WhatsAppVerification({ onBack, onSuccess, bookingInfo, username }: { onBack: () => void, onSuccess: () => void, bookingInfo: { date: Date, time: string }, username: string }) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleBooking = async () => {
        setIsSubmitting(true)
        try {
            await createAppointment({
                username,
                date: bookingInfo.date,
                time: bookingInfo.time,
                clientName: name,
                clientPhone: phone,
                clientEmail: email
            });
            onSuccess();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error al agendar")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={onBack} className="text-sm font-bold text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Regresar a fecha y hora
            </button>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">3. Validación WhatsApp</h2>
                </div>

                {!otpSent ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Tu Nombre</label>
                            <input
                                type="text"
                                placeholder="Escribe tu nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 px-4 outline-none font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold">Tu WhatsApp</label>
                            <p className="text-sm text-muted-foreground">Te enviaremos un código de acceso.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">+57</span>
                                <input
                                    type="tel"
                                    placeholder="300 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-lg transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setOtpSent(true)}
                            disabled={phone.length < 10 || name.length < 3}
                            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold shadow-lg shadow-[#25D366]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            Enviar código por WhatsApp
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-accent/50 rounded-2xl text-sm border-2 border-dashed">
                            Enviamos un código a <span className="font-bold">+57 {phone}</span>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold">Código de 6 dígitos</label>
                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        className="w-full aspect-square text-center bg-card border-2 border-transparent focus:border-primary rounded-xl outline-none font-black text-2xl"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-6">
                            <label className="text-sm font-bold">Correo de Gmail para recordatorios</label>
                            <p className="text-xs text-muted-foreground italic">Te avisaremos un día antes y 2 horas antes de tu cita.</p>
                            <input
                                type="email"
                                placeholder="tu-correo@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 px-4 outline-none font-medium transition-all"
                            />
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={isSubmitting || email.length < 5}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Cita"}
                        </button>

                        {!isSubmitting && (
                            <button onClick={() => setOtpSent(false)} className="w-full text-xs font-bold text-muted-foreground hover:underline">
                                ¿No recibiste el código? Volver a intentar
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}

function SuccessView({ bookingInfo, username }: { bookingInfo: { date: Date, time: string }, username: string }) {
    return (
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-green-500/10 rounded-full mx-auto flex items-center justify-center border-2 border-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">¡Cita Confirmada!</h2>
                <p className="text-muted-foreground">Tu espacio con @{username} ha sido reservado con éxito.</p>
            </div>

            <div className="bg-card border-2 rounded-3xl p-6 space-y-4 shadow-xl shadow-accent/20">
                <div className="flex items-center gap-4 text-left">
                    <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Fecha</p>
                        <p className="font-bold">{format(bookingInfo.date, "EEEE, d 'de' MMMM", { locale: es })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-left border-t pt-4">
                    <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Hora</p>
                        <p className="font-bold">{bookingInfo.time}</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground italic px-8">
                Recibirás los recordatorios en tu correo de Gmail según lo configurado.
            </p>

            <button
                onClick={() => window.location.reload()}
                className="w-full py-4 border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98]"
            >
                Agendar otra cita
            </button>
        </div>
    )
}
