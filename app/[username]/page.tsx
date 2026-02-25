"use client"

import { useState, useEffect, use } from "react"
import { format, addDays, startOfToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, MessageSquare, Loader2, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfileForBooking, getAvailableSlots, createAppointment } from "@/app/actions/booking"

interface ServiceOption {
    id: string
    name: string
    durationMinutes: number
}

interface ProfileData {
    displayName: string
    bio: string
    username: string
    image: string | null
    services: ServiceOption[]
}

export default function BookingPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params)
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [profileError, setProfileError] = useState(false)

    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [step, setStep] = useState(0) // 0: Select service, 1: Select date/time, 2: WhatsApp OTP, 3: Success
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileForBooking(username)
                setProfileData(data)
                // If only one service, auto-select it
                if (data.services.length === 1) {
                    setSelectedService(data.services[0])
                    setStep(1)
                } else if (data.services.length === 0) {
                    // No services configured, go directly to date/time with default 30 min
                    setSelectedService({ id: "", name: "Cita General", durationMinutes: 30 })
                    setStep(1)
                }
            } catch (error) {
                console.error(error)
                setProfileError(true)
            } finally {
                setLoadingProfile(false)
            }
        }
        fetchProfile()
    }, [username])

    // Fetch slots when date or service changes
    useEffect(() => {
        if (step < 1 || !selectedService) return
        const fetchSlots = async () => {
            setLoadingSlots(true)
            try {
                const available = await getAvailableSlots(username, selectedDate, selectedService.durationMinutes)
                setSlots(available)
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedDate, username, selectedService, step])

    // Next 14 days for date selection
    const days = [...Array(14)].map((_, i) => addDays(startOfToday(), i))

    const handleSelectService = (service: ServiceOption) => {
        setSelectedService(service)
        setSelectedTime(null)
        setStep(1)
    }

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground animate-pulse">Cargando...</p>
                </div>
            </div>
        )
    }

    if (profileError || !profileData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4 max-w-sm px-6">
                    <div className="h-16 w-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-2xl">😕</span>
                    </div>
                    <h1 className="text-xl font-bold">Perfil no encontrado</h1>
                    <p className="text-muted-foreground text-sm">No pudimos encontrar un profesional con el usuario <span className="font-bold">@{username}</span>.</p>
                </div>
            </div>
        )
    }

    const displayName = profileData.displayName

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            <main className="max-w-md mx-auto px-6 py-12 md:py-20 space-y-10">

                {/* Header Perfil */}
                <header className="text-center space-y-4">
                    {profileData.image ? (
                        <img
                            src={profileData.image}
                            alt={displayName}
                            className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-primary/10"
                        />
                    ) : (
                        <div className="h-20 w-20 bg-accent rounded-full mx-auto flex items-center justify-center text-2xl font-bold border-2 border-primary/10">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-display font-bold">Reserva con {displayName}</h1>
                        {profileData.bio && (
                            <p className="text-muted-foreground text-sm mt-1">{profileData.bio}</p>
                        )}
                        {!profileData.bio && (
                            <p className="text-muted-foreground text-sm">Escoge el mejor momento para nuestra cita.</p>
                        )}
                    </div>
                </header>

                {/* Step 0: Service Selection */}
                {step === 0 && profileData.services.length > 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Briefcase className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">1. Selecciona el Servicio</h2>
                            </div>
                            <div className="space-y-3">
                                {profileData.services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => handleSelectService(service)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4",
                                            selectedService?.id === service.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                : "bg-card border-transparent hover:border-accent"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            selectedService?.id === service.id ? "bg-primary-foreground/20" : "bg-primary/10"
                                        )}>
                                            <Briefcase className={cn(
                                                "h-5 w-5",
                                                selectedService?.id === service.id ? "text-primary-foreground" : "text-primary"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">{service.name}</p>
                                            <div className="flex items-center gap-1.5 text-xs opacity-70 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {service.durationMinutes >= 60
                                                        ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}min` : ""}`
                                                        : `${service.durationMinutes} min`}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* Step 1: Date/Time */}
                {step === 1 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Selected Service Badge */}
                        {selectedService && profileData.services.length > 1 && (
                            <button
                                onClick={() => { setStep(0); setSelectedTime(null) }}
                                className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                Cambiar servicio
                            </button>
                        )}

                        {selectedService && (
                            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedService.name}</p>
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold shrink-0">
                                    {selectedService.durationMinutes >= 60
                                        ? `${Math.floor(selectedService.durationMinutes / 60)}h ${selectedService.durationMinutes % 60 > 0 ? `${selectedService.durationMinutes % 60}min` : ""}`
                                        : `${selectedService.durationMinutes} min`}
                                </span>
                            </div>
                        )}

                        {/* Selector de Fecha */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <CalendarIcon className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    {profileData.services.length > 1 ? "2" : "1"}. Selecciona el Día
                                </h2>
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
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    {profileData.services.length > 1 ? "3" : "2"}. Selecciona la Hora
                                </h2>
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
                        username={username}
                        serviceId={selectedService?.id || undefined}
                        onBack={() => setStep(1)}
                        onSuccess={() => setStep(3)}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                ) : step === 3 ? (
                    <SuccessView
                        displayName={displayName}
                        serviceName={selectedService?.name}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                ) : null}

            </main>
        </div>
    )
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
}

function WhatsAppVerification({ onBack, onSuccess, bookingInfo, username, serviceId }: {
    onBack: () => void,
    onSuccess: () => void,
    bookingInfo: { date: Date, time: string },
    username: string,
    serviceId?: string
}) {
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
                clientEmail: email,
                serviceId
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
                    <h2 className="text-sm font-bold uppercase tracking-wider">Validación WhatsApp</h2>
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

function SuccessView({ bookingInfo, displayName, serviceName }: {
    bookingInfo: { date: Date, time: string },
    displayName: string,
    serviceName?: string
}) {
    return (
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-green-500/10 rounded-full mx-auto flex items-center justify-center border-2 border-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">¡Cita Confirmada!</h2>
                <p className="text-muted-foreground">Tu espacio con {displayName} ha sido reservado con éxito.</p>
            </div>

            <div className="bg-card border-2 rounded-3xl p-6 space-y-4 shadow-xl shadow-accent/20">
                {serviceName && (
                    <div className="flex items-center gap-4 text-left">
                        <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Servicio</p>
                            <p className="font-bold">{serviceName}</p>
                        </div>
                    </div>
                )}
                <div className={cn("flex items-center gap-4 text-left", serviceName && "border-t pt-4")}>
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
