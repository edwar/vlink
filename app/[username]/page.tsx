"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { format, addDays, startOfTomorrow, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, CheckCircle2, MessageSquare, Loader2, Briefcase, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfileForBooking, getAvailableSlots, createAppointment, generateAndSendOTP, verifyOTP } from "@/app/actions/booking"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

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
    const [selectedDate, setSelectedDate] = useState<Date>(startOfTomorrow())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [step, setStep] = useState(0) // 0: Select service, 1: Select date/time, 2: WhatsApp OTP, 3: Success
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileForBooking(username)
                if (!data) {
                    setProfileError(true)
                    return
                }
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
    const days = [...Array(14)].map((_, i) => addDays(startOfTomorrow(), i))

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
            <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col relative px-6">
                {/* Abstract Background Blur */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="space-y-4">
                        <div className="h-20 w-20 bg-primary/10 rounded-[28px] mx-auto flex items-center justify-center border-2 border-primary/20 rotate-3 shadow-xl shadow-primary/10 group">
                            <UserX className="h-10 w-10 text-primary animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-display font-black tracking-tighter">
                                Perfil no encontrado
                            </h1>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm md:text-base leading-relaxed">
                                El usuario <span className="text-foreground font-bold italic underline decoration-primary/30">@{username}</span> no parece estar registrado en nuestra plataforma.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-[280px]">
                        <Link
                            href="/"
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Ver otras agendas
                        </Link>
                        <Link
                            href="/login"
                            className="w-full py-4 bg-card border border-primary/10 rounded-2xl font-bold text-sm transition-all hover:bg-accent flex items-center justify-center gap-2"
                        >
                            Crear mi propio VLink
                        </Link>
                    </div>

                    <div className="pt-8">
                        <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                            <Logo className="h-5 w-5" />
                            <span className="text-sm font-display font-black tracking-tighter">VLINK</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const displayName = profileData.displayName

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative">
            {/* Theme Toggle - Floating Top Right */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <main className="max-w-md mx-auto px-6 py-12 md:py-20 space-y-10">

                {/* Header Perfil */}
                <header className="text-center space-y-4">
                    {profileData.image && !imageError ? (
                        <img
                            src={profileData.image}
                            alt={displayName}
                            onError={() => setImageError(true)}
                            referrerPolicy="no-referrer"
                            className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-primary/10 shadow-sm transition-opacity duration-300"
                        />
                    ) : (
                        <div className="h-20 w-20 bg-primary/5 rounded-full mx-auto flex items-center justify-center text-2xl font-black border-2 border-primary/10 text-primary uppercase tracking-tighter">
                            {displayName.charAt(0)}
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
                    <ClientVerification
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

function ClientVerification({ onBack, onSuccess, bookingInfo, username, serviceId }: {
    onBack: () => void,
    onSuccess: () => void,
    bookingInfo: { date: Date, time: string },
    username: string,
    serviceId?: string
}) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [phone, setPhone] = useState("")

    // 0: Email/Name input, 1: OTP verification, 2: Phone input & Confirm
    const [verificationStep, setVerificationStep] = useState(0)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSendOTP = async () => {
        setError(null)
        setIsSubmitting(true)
        try {
            await generateAndSendOTP(email, name)
            setVerificationStep(1)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error enviando el código")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length < 6) return
        setError(null)
        setIsSubmitting(true)
        try {
            await verifyOTP(email, otp)
            setVerificationStep(2)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Código incorrecto")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBooking = async () => {
        if (phone.length < 10) {
            setError("Por favor ingresa un número de teléfono válido")
            return
        }
        setError(null)
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al agendar")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return

        const newOtp = otp.split('')
        newOtp[index] = value
        setOtp(newOtp.join(''))

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            prevInput?.focus()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {verificationStep === 0 && (
                <button onClick={onBack} className="text-sm font-bold text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Regresar a fecha y hora
                </button>
            )}

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Tus Datos</h2>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                        {error}
                    </div>
                )}

                {verificationStep === 0 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Tu Nombre</label>
                            <input
                                type="text"
                                placeholder="Escribe tu nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 px-4 outline-none font-medium transition-all disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold">Tu Correo Institucional o Personal</label>
                            <p className="text-xs text-muted-foreground">Te enviaremos un código de validación a este correo.</p>
                            <input
                                type="email"
                                placeholder="tu-correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 px-4 outline-none font-medium transition-all disabled:opacity-50"
                            />
                        </div>

                        <button
                            onClick={handleSendOTP}
                            disabled={isSubmitting || name.length < 3 || email.length < 5 || !email.includes('@')}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar código al correo"}
                        </button>
                    </div>
                )}

                {verificationStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 bg-accent/50 rounded-2xl text-sm border-2 border-dashed">
                            Enviamos un código de 6 dígitos a <span className="font-bold">{email}</span>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold">Código de verificación</label>
                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={otp[i] || ''}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        disabled={isSubmitting}
                                        className="w-full aspect-square text-center bg-card border-2 border-transparent focus:border-primary rounded-xl outline-none font-black text-xl disabled:opacity-50 transition-colors"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={isSubmitting || otp.length < 6}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar código"}
                        </button>

                        <button
                            onClick={handleSendOTP}
                            disabled={isSubmitting}
                            className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                        >
                            ¿No has recibido el código? Reenviar
                        </button>

                        <button
                            onClick={() => { setVerificationStep(0); setOtp(""); setError(null); }}
                            disabled={isSubmitting}
                            className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                        >
                            Cambiar correo electrónico
                        </button>
                    </div>
                )}

                {verificationStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 bg-green-500/10 border-green-500/20 rounded-2xl text-sm border-2 text-green-600 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            Correo verificado exitosamente
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold">Número de WhatsApp</label>
                            <p className="text-xs text-muted-foreground">El profesional te contactará a este número.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">+57</span>
                                <input
                                    type="tel"
                                    placeholder="300 000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-card border-2 border-transparent focus:border-primary rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-lg transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={isSubmitting || phone.length < 10}
                            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold shadow-lg shadow-[#25D366]/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Cita"}
                        </button>
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
                {/* Decorative Footer Element */}
                <div className="h-2 w-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
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
