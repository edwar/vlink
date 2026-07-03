"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, Variants } from "framer-motion"
import { format, addDays, startOfTomorrow, isSameDay, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Check, MessageSquare, Loader2, Briefcase, UserX, CalendarOff, Sparkles, AlertCircle, CalendarX2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfileForBooking, getAvailableSlots, createAppointment, getLocationsByOrgId } from "@/app/actions/booking"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingState } from "@/components/loading-state"
import { isHolidayColombia } from "@/lib/holidays"
import { Logo } from "@/components/logo"
import { sileo } from "sileo"
import { MapPin, Navigation, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"

interface ServiceOption {
    id: string
    name: string
    durationMinutes: number
    price: number | null
}

interface LocationInfo {
    id: string
    name: string
    address: string
    city: string
    phone: string | null
}

interface ProfileData {
    displayName: string
    bio: string
    username: string
    image: string | null
    advanceNoticeHours: number
    expertise: string[]
    services: ServiceOption[]
    isLocked: boolean
    organizationId: string
    locationServices: { locationId: string, serviceId: string }[]
}

export function BookingClient({ params }: { params: { username: string } }) {
    const { username } = params
    const searchParams = useSearchParams()
    const queryDate = searchParams.get("date")
    const queryLocationId = searchParams.get("locationId")

    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [profileError, setProfileError] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null)
    const [locations, setLocations] = useState<LocationInfo[]>([])
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
    const [step, setStep] = useState(-1) // -1: Select location (if many), 0: Select service, 1: Select date/time, 2: Client details, 3: Success
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [noServices, setNoServices] = useState(false)
    const [showExpertise, setShowExpertise] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileForBooking(username) as any
                if (!data) {
                    setProfileError(true)
                    return
                }
                setProfileData(data)

                // Fetch locations for organization
                const orgLocs: LocationInfo[] = data.organizationId ? await getLocationsByOrgId(data.organizationId) : []

                // Filter locations: Only show those where the professional has AT LEAST one service mapped
                // If NO mappings exist at all for the professional, show all org locations (fallback)
                const availableLocs = (!data.locationServices?.length)
                    ? orgLocs
                    : orgLocs.filter(loc => data.locationServices.some((ls: { locationId: string, serviceId: string }) => ls.locationId === loc.id));

                setLocations(availableLocs)

                if (queryLocationId) {
                    const loc = availableLocs.find((l: any) => l.id === queryLocationId)
                    if (loc) {
                        setSelectedLocation(loc)
                    }
                } else if (availableLocs.length === 1) {
                    setSelectedLocation(availableLocs[0])
                }

                // Service selection logic
                const currentLoc = queryLocationId
                    ? availableLocs.find(l => l.id === queryLocationId)
                    : (availableLocs.length === 1 ? availableLocs[0] : null);

                const currentLocId = currentLoc?.id;

                const filteredServices = (!availableLocs.length || !data.locationServices?.length)
                    ? data.services
                    : data.services.filter((s: ServiceOption) =>
                        data.locationServices.some((ls: { locationId: string, serviceId: string }) => ls.locationId === currentLocId && ls.serviceId === s.id)
                    );

                if (filteredServices.length === 0 && (currentLocId || availableLocs.length <= 1)) {
                    setNoServices(true)
                } else if (filteredServices.length === 1 && currentLocId) {
                    setSelectedService(filteredServices[0])
                    setStep(1)
                } else if (availableLocs.length > 1 && !currentLocId) {
                    setStep(-1)
                } else {
                    setStep(0)
                }
            } catch (error) {
                console.error(error)
                setProfileError(true)
            } finally {
                setLoadingProfile(false)
            }
        }
        fetchProfile()
    }, [username, queryLocationId])

    // Fetch slots when date or service changes
    useEffect(() => {
        if (step < 1 || !selectedService || profileData?.isLocked) return
        const fetchSlots = async () => {
            setLoadingSlots(true)
            try {
                const available = await getAvailableSlots(
                    username,
                    selectedDate,
                    selectedService.durationMinutes,
                    selectedLocation?.id
                )
                setSlots(available)
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedDate, username, selectedService, step, profileData?.isLocked, selectedLocation?.id])

    // Calculate the first selectable day based on advanceNoticeHours
    const firstEligibleDate = profileData
        ? new Date(Date.now() + (profileData.advanceNoticeHours ?? 24) * 60 * 60 * 1000)
        : startOfTomorrow()

    const baseDate = new Date(firstEligibleDate)
    baseDate.setHours(0, 0, 0, 0)

    const days = [...Array(14)].map((_, i) => addDays(baseDate, i))

    useEffect(() => {
        if (profileData && !profileData.isLocked) {
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

            if (selectedDate.getTime() < baseDate.getTime()) {
                setSelectedDate(baseDate)
            }
        }
    }, [profileData, queryDate])

    const handleSelectLocation = (location: LocationInfo) => {
        setSelectedLocation(location)
        if (!profileData) return

        const filteredServices = (!profileData.locationServices?.length)
            ? profileData.services
            : profileData.services.filter((s: ServiceOption) =>
                profileData.locationServices.some((ls: { locationId: string, serviceId: string }) => ls.locationId === location.id && ls.serviceId === s.id)
            );

        if (filteredServices.length === 1) {
            setSelectedService(filteredServices[0])
            setStep(1)
        } else {
            setStep(0)
        }
    }

    const handleSelectService = (service: ServiceOption) => {
        if (profileData?.isLocked) return
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
                        <div className="h-20 w-20 bg-primary/10 rounded-[28px] mx-auto flex items-center justify-center border-2 border-primary/20 shadow-none">
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
                        <Button
                            asChild
                            size="lg"
                            variant="vlink"
                            className="w-full"
                        >
                            <Link href="/">
                                <CalendarIcon className="h-4 w-4" />
                                Ver otras agendas
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full"
                        >
                            <Link href="/login">
                                Crear mi propio VLink
                            </Link>
                        </Button>
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
    const holidayInfo = isHolidayColombia(selectedDate)

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative">
            {profileData.isLocked && (
                <div className="sticky top-0 z-100 w-full bg-amber-500 text-white py-3 px-6 shadow-none animate-in slide-in-from-top duration-500">
                    <div className="max-w-md mx-auto flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-xs font-bold leading-tight">
                            Este servicio no está disponible por ahora. Comunícate con el administrador para habilitar la agenda nuevamente.
                        </p>
                    </div>
                </div>
            )}

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <main id="main-content" className={cn(
                "max-w-xl mx-auto px-6 py-12 md:py-20 space-y-10 transition-all duration-700 outline-none",
                profileData.isLocked && "opacity-40 pointer-events-none grayscale-[0.5]"
            )} tabIndex={-1}>

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
                                priority
                                className="rounded-full object-cover border-2 border-primary/10 shadow-none"
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
                                        className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-none group"
                                    >
                                        <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
                                        <span>Experticia</span>
                                    </button>
                                    {showExpertise && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-none z-50 min-w-[220px] animate-in zoom-in-90 fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {profileData.expertise.map((skill) => (
                                                    <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-tight">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
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

                {step === -1 && locations.length > 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <MapPin className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">Selecciona la Sede</h2>
                            </div>
                            <div className="grid gap-4">
                                {locations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => handleSelectLocation(loc)}
                                        className="w-full p-6 rounded-4xl border-2 border-muted-foreground/20 text-left transition-all hover:border-primary/40 hover:bg-primary/5 flex items-start gap-4 group/loc"
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover/loc:scale-110 transition-transform">
                                            <Navigation className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-xl tracking-tight">{loc.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{loc.address}, {loc.city}</p>
                                            {loc.phone && (
                                                <div className="flex items-center gap-2 mt-2 text-primary/60">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-xs font-bold">{loc.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {step === 0 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {locations.length > 1 && (
                            <button
                                onClick={() => setStep(-1)}
                                className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                Cambiar sede
                            </button>
                        )}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary" aria-hidden="true">
                                <Briefcase className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    {locations.length > 1 ? "2" : "1"}. Selecciona el Servicio
                                </h2>
                            </div>
                            <h2 className="sr-only">Selecciona el Servicio</h2>
                            <div className="space-y-3">
                                {profileData.services
                                    .filter(service => {
                                        if (!selectedLocation || !profileData.locationServices?.length) return true;
                                        return profileData.locationServices.some(
                                            ls => ls.locationId === selectedLocation.id && ls.serviceId === service.id
                                        );
                                    })
                                    .map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => handleSelectService(service)}
                                            disabled={profileData.isLocked}
                                            className={cn(
                                                "w-full p-5 rounded-4xl border-2 border-muted-foreground/20 text-left transition-all flex items-center gap-4 group/btn",
                                                selectedService?.id === service.id
                                                    ? "bg-primary/90 text-primary-foreground border-primary shadow-none scale-[1.02]"
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

                {step === 1 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {selectedService && profileData.services.length > 1 && (
                            <button
                                onClick={() => { setStep(0); setSelectedTime(null) }}
                                disabled={profileData.isLocked}
                                className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                Cambiar servicio
                            </button>
                        )}

                        {selectedLocation && locations.length > 1 && (
                            <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/40 rounded-xl mb-4">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedLocation.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{selectedLocation.city}</p>
                                </div>
                            </div>
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

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <CalendarIcon className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    {(profileData.services.length > 1 ? 1 : 0) + (locations.length > 1 ? 1 : 0) + 1}. Selecciona el Día
                                </h2>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
                                {days.map((day) => (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        disabled={profileData.isLocked}
                                        aria-pressed={isSameDay(day, selectedDate)}
                                        aria-label={`Seleccionar ${format(day, "EEEE d 'de' MMMM", { locale: es })}`}
                                        className={cn(
                                            "flex flex-col items-center min-w-[64px] p-4 rounded-2xl border border-primary/10 transition-all focus-visible:ring-2 focus-visible:ring-primary",
                                            isSameDay(day, selectedDate)
                                                ? "bg-primary text-primary-foreground border-primary shadow-none scale-105"
                                                : "bg-card hover:border-accent"
                                        )}
                                    >
                                        <span className="text-[10px] uppercase font-bold opacity-70" aria-hidden="true">
                                            {format(day, "eee", { locale: es })}
                                        </span>
                                        <span className="text-lg font-bold" aria-hidden="true">
                                            {format(day, "d")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock className="h-4 w-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    {(profileData.services.length > 1 ? 1 : 0) + (locations.length > 1 ? 1 : 0) + 2}. Selecciona la Hora
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
                                            disabled={profileData.isLocked}
                                            className={cn(
                                                "py-3 rounded-xl font-semibold text-sm border border-primary/10 transition-all",
                                                selectedTime === time
                                                    ? "bg-primary text-primary-foreground border-primary shadow-none"
                                                    : "bg-card hover:border-accent"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title={holidayInfo.isHoliday ? 'Día Festivo' : 'Horarios'}
                                    description={holidayInfo.isHoliday
                                        ? `Hoy es ${holidayInfo.name}. No hay atención en días festivos.`
                                        : "No hay horarios disponibles para este día."}
                                    icon={holidayInfo.isHoliday ? CalendarX2 : CalendarOff}
                                />
                            )}
                        </section>
                        <div className="h-24 sm:hidden" />
                    </div>
                ) : step === 2 ? (
                    <ClientVerification
                        username={username}
                        serviceId={selectedService?.id || undefined}
                        onBack={() => setStep(1)}
                        onSuccess={() => setStep(3)}
                        bookingInfo={{ date: selectedDate, time: selectedTime!, locationId: selectedLocation?.id }}
                    />
                ) : step === 3 ? (
                    <SuccessView
                        displayName={displayName}
                        serviceName={selectedService?.name}
                        price={selectedService?.price}
                        locationInfo={selectedLocation}
                        bookingInfo={{ date: selectedDate, time: selectedTime! }}
                    />
                ) : null}
            </main>

            <div className={cn(
                "fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-background via-background/95 to-transparent pt-12 z-50 pointer-events-none transition-all duration-300",
                step === 1 && !profileData.isLocked ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="max-w-md mx-auto pointer-events-auto">
                    <Button
                        disabled={!selectedTime || profileData.isLocked}
                        onClick={() => setStep(2)}
                        variant="vlink"
                        size="lg"
                        className="w-full"
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
    bookingInfo: { date: Date, time: string, locationId?: string },
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
                serviceId,
                locationId: bookingInfo.locationId
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
                            className="font-medium"
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
                            className="font-medium"
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
                                className="pl-16 font-bold"
                            />
                        </div>
                    </div>

                    <Button
                        variant="vlink"
                        size="lg"
                        onClick={handleBooking}
                        disabled={isSubmitting || name.length < 3 || email.length < 5 || phone.replace(/\D/g, '').length < 10}
                        className="w-full text-xl hover:shadow-none hover:-translate-y-1"
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

function SuccessView({ bookingInfo, displayName, serviceName, price, locationInfo }: {
    bookingInfo: { date: Date, time: string },
    displayName: string,
    serviceName?: string,
    price?: number | null,
    locationInfo?: LocationInfo | null
}) {
    const itemMotion: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="text-center space-y-10 py-6 overflow-visible perspective-[1000px]">
            {/* Checkmark Section */}
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                {/* Continuous Pulse Rings */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.8], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary/30 rounded-full"
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.8], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2.5, delay: 1.25, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary/30 rounded-full"
                />

                {/* Main Checkmark Bubble */}
                <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
                    className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center border-4border-background shadow-xl shadow-primary/20 backdrop-blur-sm"
                >
                    <motion.svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary drop-shadow-md"
                    >
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                            d="M20 6 9 17l-5-5"
                        />
                    </motion.svg>
                </motion.div>
            </div>

            {/* Title Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="space-y-3"
            >
                <h2 className="text-4xl font-display font-black tracking-tighter text-foreground drop-shadow-sm">¡Cita Confirmada!</h2>
                <p className="text-muted-foreground font-medium text-base">Tu espacio con <span className="text-foreground font-bold">{displayName}</span> ha sido reservado con éxito.</p>
            </motion.div>

            {/* Ticket Card Section with 3D Flip */}
            <motion.div
                initial={{ opacity: 0, rotateX: 45, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, type: "spring", damping: 22, stiffness: 120 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                <div className="bg-card border border-primary/5 rounded-[32px] p-2 flex flex-col shadow-[0_20px_40px_-15px_rgba(var(--primary),0.15)] relative overflow-hidden">
                    {/* Decorative flares */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 blur-[50px] rounded-full translate-y-1/2 -translate-x-1/2" />

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } }
                        }}
                        className="p-6 pb-8 space-y-6 relative z-10 w-full text-left"
                    >
                        {serviceName && (
                            <motion.div variants={itemMotion} className="flex flex-col gap-1 w-full relative">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Servicio</p>
                                <p className="font-bold text-lg leading-tight md:truncate pr-2">{serviceName}</p>
                            </motion.div>
                        )}

                        {locationInfo && (
                            <motion.div variants={itemMotion} className="flex flex-col gap-1 w-full border-t border-dashed border-border/60 pt-5 relative">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Ubicación</p>
                                <p className="font-bold text-[15px] leading-tight pr-2">{locationInfo.name}</p>
                                <p className="text-xs text-muted-foreground">{locationInfo.address}, {locationInfo.city}</p>
                            </motion.div>
                        )}

                        {price !== undefined && price !== null && (
                            <motion.div variants={itemMotion} className="flex flex-col gap-1 w-full border-t border-dashed border-border/60 pt-5 relative">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Inversión / Pago</p>
                                <p className="font-black text-3xl tracking-tight text-primary mt-1">$ {price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</p>
                            </motion.div>
                        )}

                        <motion.div variants={itemMotion} className="h-px w-full border-t-[2.5px] border-dashed border-border/70 my-4 relative">
                            {/* Ticket notches */}
                            <div className="absolute -left-9 -top-3 w-6 h-6 bg-background rounded-full border-r-[2.5px] border-border/70 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]" />
                            <div className="absolute -right-9 -top-3 w-6 h-6 bg-background rounded-full border-l-[2.5px] border-border/70 shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)]" />
                        </motion.div>

                        <motion.div variants={itemMotion} className="flex items-start gap-8 px-1 relative">
                            <div className="space-y-1 w-full">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                        <CalendarIcon className="h-3 w-3 text-primary" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fecha</p>
                                </div>
                                <p className="font-bold text-[15px] capitalize leading-tight pl-1">{format(bookingInfo.date, "EEEE, d 'de' MMMM", { locale: es })}</p>
                            </div>
                            <div className="space-y-1 shrink-0 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hora</p>
                                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Clock className="h-3 w-3 text-primary" />
                                    </div>
                                </div>
                                <p className="font-bold text-[17px] leading-tight pr-1">{bookingInfo.time}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Footer Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="space-y-6 pt-4"
            >
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest px-8 max-w-[300px] mx-auto leading-relaxed">
                    Hemos enviado los detalles a tu correo electrónico.
                </p>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.location.reload()}
                        className="w-full font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all border-2 rounded-2xl h-14"
                    >
                        Agendar otra cita
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}
