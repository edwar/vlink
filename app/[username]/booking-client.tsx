"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format, addDays, startOfTomorrow, isSameDay, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Check, MessageSquare, Loader2, Briefcase, UserX, CalendarOff, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfileForBooking, getAvailableSlots, createAppointment } from "@/app/actions/booking"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingState } from "@/components/loading-state"
import { Logo } from "@/components/logo"
import { sileo } from "sileo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"

interface ServiceOption {
    id: string
    name: string
    durationMinutes: number
    price: number | null
}

interface ProfileData {
    displayName: string
    bio: string
    username: string
    image: string | null
    advanceNoticeHours: number
    expertise: string[]
    services: ServiceOption[]
}

export function BookingClient({ params }: { params: { username: string } }) {
    const { username } = params
    const searchParams = useSearchParams()
    const queryDate = searchParams.get("date")

    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [profileError, setProfileError] = useState(false)

    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        if (queryDate) {
            const [year, month, day] = queryDate.split('-').map(Number)
            const parsed = new Date(year, month - 1, day)
            if (isValid(parsed)) return parsed
        }
        return startOfTomorrow()
    })
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [step, setStep] = useState(0) // 0: Select service, 1: Select date/time, 2: Client details, 3: Success
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [noServices, setNoServices] = useState(false)
    const [showExpertise, setShowExpertise] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileForBooking(username)
                if (!data) {
                    setProfileError(true)
                    return
                }
                setProfileData(data)
                // If only one service, auto-select it and skip service-selection step
                if (data.services.length === 1) {
                    setSelectedService(data.services[0])
                    setStep(1)
                } else if (data.services.length === 0) {
                    // No services configured — show informative empty state
                    setNoServices(true)
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

    // Calculate the first selectable day based on advanceNoticeHours
    // If advanceNoticeHours is 0, they can book today (if there are slots left in the day).
    const firstEligibleDate = profileData
        ? new Date(Date.now() + (profileData.advanceNoticeHours ?? 24) * 60 * 60 * 1000)
        : startOfTomorrow()

    // Reset the time portion to the start of the day so the calendar selection starts cleanly
    const baseDate = new Date(firstEligibleDate)
    baseDate.setHours(0, 0, 0, 0)

    // Next 14 days for date selection
    const days = [...Array(14)].map((_, i) => addDays(baseDate, i))

    // Set initial selected date to the first eligible date if not set already
    useEffect(() => {
        if (profileData) {
            // Priority 1: Query param date (if valid and within range)
            if (queryDate) {
                const [year, month, day] = queryDate.split('-').map(Number)
                const parsed = new Date(year, month - 1, day)
                if (isValid(parsed)) {
                    const isInRange = days.some(day => isSameDay(day, parsed))
                    if (isInRange) {
                        setSelectedDate(parsed)
                        return
                    }
                }
            }

            // Priority 2: Ensure selectedDate isn't before baseDate
            if (selectedDate.getTime() < baseDate.getTime()) {
                setSelectedDate(baseDate)
            }
        }
    }, [profileData, queryDate])

    const handleSelectService = (service: ServiceOption) => {
        setSelectedService(service)
        setSelectedTime(null)
        setStep(1)
    }

    if (loadingProfile) {
        return <LoadingState />
    }

    if (noServices && profileData) {
        return (
            <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col relative px-6">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent blur-[100px] rounded-full -z-10 opacity-50" />

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="space-y-4">
                        <div className="h-20 w-20 bg-primary/10 rounded-[28px] mx-auto flex items-center justify-center border-2 border-primary/20 shadow-xl shadow-primary/10">
                            <Briefcase className="h-10 w-10 text-primary opacity-60" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-display font-black tracking-tighter">
                                Sin servicios disponibles
                            </h1>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm leading-relaxed">
                                <span className="text-foreground font-bold">{profileData.displayName || `@${username}`}</span> aún no ha configurado servicios para agendar.
                            </p>
                        </div>
                    </div>
                    <div className="pt-4">
                        <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                            <Logo className="h-5 w-5" />
                            <span className="text-sm font-display font-black tracking-tighter">VLINK</span>
                        </div>
                    </div>
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
                        <div className="relative h-20 w-20 mx-auto">
                            <Image
                                src={profileData.image}
                                alt={displayName}
                                fill
                                sizes="80px"
                                onError={() => setImageError(true)}
                                referrerPolicy="no-referrer"
                                className="rounded-full object-cover border-2 border-primary/10 shadow-sm"
                            />
                        </div>
                    ) : (
                        <div className="h-20 w-20 bg-primary/5 rounded-full mx-auto flex items-center justify-center text-2xl font-black border-2 border-primary/10 text-primary uppercase tracking-tighter">
                            {displayName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-2xl font-display font-bold">Reserva con {displayName}</h1>
                            {profileData.expertise && profileData.expertise.length > 0 && (
                                <div className="relative inline-block">
                                    <button
                                        onMouseEnter={() => setShowExpertise(true)}
                                        onMouseLeave={() => setShowExpertise(false)}
                                        onClick={() => setShowExpertise(!showExpertise)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group"
                                    >
                                        <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
                                        <span>Experticia</span>
                                    </button>
                                    {showExpertise && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl z-50 min-w-[220px] animate-in zoom-in-90 fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {profileData.expertise.map((skill) => (
                                                    <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-tight">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            {/* Tooltip Arrow */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-x-[9px] border-x-transparent border-b-[9px] border-b-primary/20" />
                                            <div className="absolute bottom-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-b-[9px] border-b-card/95" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {profileData.bio && (
                            <p className="text-muted-foreground text-sm mt-3">{profileData.bio}</p>
                        )}
                        {!profileData.bio && (
                            <p className="text-muted-foreground text-sm mt-3">Escoge el mejor momento para nuestra cita.</p>
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
                                            "w-full p-5 rounded-[2rem] border-2 border-muted-foreground/20 text-left transition-all flex items-center gap-4 group/btn",
                                            selectedService?.id === service.id
                                                ? "bg-primary/90 text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-[1.02]"
                                                : "bg-card hover:border-2 hover:border-primary/30 hover:bg-primary/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/btn:scale-110 duration-500",
                                            selectedService?.id === service.id ? "bg-primary-foreground/20" : "bg-primary/10"
                                        )}>
                                            <Briefcase className={cn(
                                                "h-6 w-6",
                                                selectedService?.id === service.id ? "text-primary-foreground" : "text-primary"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-base sm:text-lg tracking-tight mb-0.5">{service.name}</p>
                                            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs font-bold uppercase tracking-widest opacity-70">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>
                                                        {service.durationMinutes >= 60
                                                            ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ""}`
                                                            : `${service.durationMinutes} min`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("px-2 py-0.5 rounded-full", selectedService?.id === service.id ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground")}>$ {(service.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                                                </div>
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
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] text-muted-foreground font-semibold leading-none">
                                        {selectedService.durationMinutes >= 60
                                            ? `${Math.floor(selectedService.durationMinutes / 60)}h ${selectedService.durationMinutes % 60 > 0 ? `${selectedService.durationMinutes % 60}min` : ""}`
                                            : `${selectedService.durationMinutes} min`}
                                    </span>
                                    <span className="text-xs font-black text-primary leading-none">
                                        $ {(selectedService.price ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
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
                                            "flex flex-col items-center min-w-[64px] p-4 rounded-2xl border border-primary/10 transition-all",
                                            isSameDay(day, selectedDate)
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-card hover:border-accent"
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
                                                "py-3 rounded-xl font-semibold text-sm border border-primary/10 transition-all",
                                                selectedTime === time
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                    : "bg-card hover:border-accent"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Horarios"
                                    description="No hay horarios disponibles para este día."
                                    icon={CalendarOff}
                                />
                            )}
                        </section>
                        {/* Espaciador para no ocultar contenido debajo del botón flotante */}
                        <div className="h-24 sm:hidden" />
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
                        price={selectedService?.price}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                ) : null}
            </main>

            {/* Botón Continuar Global - Siempre fijo al viewport en el fondo */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-background via-background/95 to-transparent pt-12 z-50 pointer-events-none transition-all duration-300",
                step === 1 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="max-w-md mx-auto pointer-events-auto">
                    <Button
                        disabled={!selectedTime}
                        onClick={() => setStep(2)}
                        className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-bold shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Continuar
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
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
    const [phone, setPhone] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleBooking = async () => {
        const rawPhone = phone.replace(/\D/g, '')

        if (name.length < 3) {
            setError("Por favor ingresa tu nombre completo")
            return
        }

        if (!email.includes('@') || email.length < 5) {
            setError("Por favor ingresa un correo electrónico válido")
            return
        }

        if (rawPhone.length < 10) {
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
            sileo.success({
                title: "¡Cita agendada!",
                description: "Tu cita ha sido agendada correctamente."
            })
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al agendar")
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
                    <h2 className="text-sm font-bold uppercase tracking-wider">Tus Datos</h2>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="client-name" className="text-sm font-bold ml-1">Tu Nombre Completo</label>
                        <Input
                            id="client-name"
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-card h-12 rounded-2xl py-4 px-6 outline-none font-medium transition-all focus:ring-4 focus:ring-primary/5 border-2 border-primary/5 focus:border-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="client-email" className="text-sm font-bold ml-1">Correo Electrónico</label>
                        <Input
                            id="client-email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full bg-card h-12 rounded-2xl py-4 px-6 outline-none font-medium transition-all focus:ring-4 focus:ring-primary/5 border-2 border-primary/5 focus:border-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="client-phone" className="text-sm font-bold ml-1">Número de WhatsApp</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/50">+57</span>
                            <Input
                                id="client-phone"
                                type="tel"
                                placeholder="300 123 4567"
                                value={phone}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    let formattedValue = rawValue;
                                    if (rawValue.length > 6) {
                                        formattedValue = `${rawValue.slice(0, 3)} ${rawValue.slice(3, 6)} ${rawValue.slice(6)}`;
                                    } else if (rawValue.length > 3) {
                                        formattedValue = `${rawValue.slice(0, 3)} ${rawValue.slice(3)}`;
                                    }
                                    setPhone(formattedValue);
                                }}
                                disabled={isSubmitting}
                                className="w-full h-12 bg-card focus:border-primary/20 rounded-2xl py-4 pl-16 pr-6 outline-none font-bold text-lg transition-all focus:ring-4 focus:ring-primary/5 border-2 border-primary/5"
                            />
                        </div>
                    </div>

                    <Button
                        variant="default"
                        onClick={handleBooking}
                        disabled={isSubmitting || name.length < 3 || email.length < 5 || phone.replace(/\D/g, '').length < 10}
                        className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:shadow-primary/40 hover:-translate-y-1"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Check className="h-6 w-6" />
                                <span>Confirmar Cita</span>
                            </>
                        )}
                    </Button>
                </div>
            </section>
        </div>
    )
}

function SuccessView({ bookingInfo, displayName, serviceName, price }: {
    bookingInfo: { date: Date, time: string },
    displayName: string,
    serviceName?: string,
    price?: number | null
}) {
    return (
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center border-2 border-primary/20">
                <Check className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">¡Cita Confirmada!</h2>
                <p className="text-muted-foreground">Tu espacio con {displayName} ha sido reservado con éxito.</p>
            </div>

            <div className="bg-card border-2 rounded-3xl p-6 space-y-4 shadow-xl shadow-accent/20">
                {/* Decorative Footer Element */}
                <div className="h-2 w-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                {serviceName && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Servicio</p>
                                <p className="font-bold text-lg leading-tight">{serviceName}</p>
                            </div>
                        </div>
                        {price !== undefined && price !== null && (
                            <div className="sm:text-right pl-14 sm:pl-0">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Inversión</p>
                                <p className="font-black text-xl text-primary">$ {price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</p>
                            </div>
                        )}
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
                className="w-full h-12 border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98]"
            >
                Agendar otra cita
            </button>
        </div>
    )
}
