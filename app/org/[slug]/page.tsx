"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { getOrganizationPublicProfiles } from "@/app/actions/organization"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { LoadingState } from "@/components/loading-state"
import { ConsolidatedAvailability } from "@/components/consolidated-availability"
import { Building2, Briefcase, Calendar, UserX, AlertCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrgProfile {
    username: string
    displayName: string
    bio: string | null
    image: string | null
    expertise: string[]
    serviceCount: number
}

interface OrgData {
    id: string
    name: string
    slug: string
    profiles: OrgProfile[]
}

function ProfileCard({ profile }: { profile: OrgProfile }) {
    const [imageError, setImageError] = useState(false)
    const [showExpertise, setShowExpertise] = useState(false)
    const hasServices = profile.serviceCount > 0

    const cardContent = (
        <>
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Avatar */}
            <div className="relative mb-5">
                {profile.image && !imageError ? (
                    <div className={`relative h-24 w-24 rounded-3xl overflow-hidden border-2 shadow-none transition-transform duration-500 ${hasServices ? "border-primary/10 group-hover:scale-105" : "border-border grayscale opacity-60"}`}>
                        <Image
                            src={profile.image}
                            alt={profile.displayName}
                            fill
                            sizes="96px"
                            onError={() => setImageError(true)}
                            referrerPolicy="no-referrer"
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-black border-2 shadow-none uppercase transition-transform duration-500 ${hasServices ? "bg-primary/10 text-primary border-primary/10 group-hover:scale-105" : "bg-muted text-muted-foreground border-border opacity-60"}`}>
                        {profile.displayName.charAt(0)}
                    </div>
                )}
                <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-xl flex items-center justify-center shadow-none transition-transform duration-300 ${hasServices ? "bg-primary group-hover:scale-110" : "bg-muted"}`}>
                    {hasServices
                        ? <Calendar className="h-4 w-4 text-primary-foreground" />
                        : <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    }
                </div>
            </div>

            {/* Name */}
            <h3 className={`text-xl font-display font-black tracking-tight text-center transition-colors duration-300 ${hasServices ? "group-hover:text-primary" : "text-foreground/60"}`}>
                {profile.displayName}
            </h3>

            {/* Expertise Tooltip */}
            {profile.expertise && profile.expertise.length > 0 && (
                <div className="relative mt-2">
                    <button
                        onMouseEnter={() => setShowExpertise(true)}
                        onMouseLeave={() => setShowExpertise(false)}
                        onClick={(e) => { e.preventDefault(); setShowExpertise(!showExpertise) }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-none"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>Experticia</span>
                    </button>
                    {showExpertise && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-4 bg-card border border-primary/20 rounded-2xl shadow-none z-50 min-w-[180px] animate-in zoom-in-90 fade-in duration-300">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {profile.expertise.map((skill) => (
                                    <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/10 rounded-lg text-[8px] font-black uppercase tracking-tight whitespace-nowrap">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="absolute top-[99%] left-1/2 -translate-x-1/2 border-8 border-transparent border-t-card" />
                        </div>
                    )}
                </div>
            )}

            {/* Bio */}
            {profile.bio && (
                <p className="text-sm text-muted-foreground text-center mt-2 line-clamp-2 font-medium leading-relaxed">
                    {profile.bio}
                </p>
            )}

            {/* Services count or no-service warning */}
            <div className="mt-4">
                {hasServices ? (
                    <div className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Briefcase className="h-3 w-3" />
                        {profile.serviceCount} {profile.serviceCount === 1 ? "Servicio" : "Servicios"}
                    </div>
                ) : (
                    <div className="px-3 py-1.5 rounded-full bg-muted border border-border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Sin servicios aún
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className={`mt-5 w-full py-3 rounded-2xl text-center text-xs font-black uppercase tracking-wider transition-all duration-300 ${hasServices
                ? "bg-primary/5 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                : "bg-muted border border-border text-muted-foreground cursor-not-allowed"
                }`}>
                {hasServices ? "Agendar cita" : "No disponible"}
            </div>
        </>
    )

    if (!hasServices) {
        return (
            <div className="group relative flex flex-col items-center p-8 rounded-3xl border-2 border-border bg-card/60 overflow-hidden opacity-70 cursor-default">
                {cardContent}
            </div>
        )
    }

    return (
        <Link
            href={`/${profile.username}`}
            className="group relative flex flex-col items-center p-8 rounded-3xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-none hover:-translate-y-1 transition-all duration-500 overflow-hidden shadow-none"
        >
            {cardContent}
        </Link>
    )
}

export default function OrgPublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [orgData, setOrgData] = useState<OrgData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        getOrganizationPublicProfiles(slug).then(data => {
            if (!data) setNotFound(true)
            else setOrgData(data)
        }).catch(() => setNotFound(true)).finally(() => setLoading(false))
    }, [slug])

    if (loading) return <LoadingState />

    if (notFound || !orgData) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 gap-8 text-center">
                <div className="h-20 w-20 bg-primary/10 rounded-[28px] flex items-center justify-center border-2 border-primary/20 rotate-3 shadow-none">
                    <UserX className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-black tracking-tighter">Organización no encontrada</h1>
                    <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                        La organización <span className="text-foreground font-bold italic">@{slug}</span> no existe o no está disponible.
                    </p>
                </div>
                <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-none hover:scale-105 transition-transform">
                    Volver al inicio
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            {/* Background blurs */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-accent/50 blur-[120px] rounded-full -z-10 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <main className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-16">

                {/* Header */}
                <header className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Building2 className="h-3.5 w-3.5" />
                        Organización
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter">
                        {orgData.name}
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl mx-auto">
                        Selecciona un profesional y agenda tu cita de forma rápida y sencilla.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold border">
                            {orgData.profiles.length} {orgData.profiles.length === 1 ? "Profesional disponible" : "Profesionales disponibles"}
                        </span>
                    </div>
                </header>

                {/* Consolidated Availability Search */}
                {orgData.profiles.length > 0 && (
                    <ConsolidatedAvailability orgSlug={orgData.slug} />
                )}

                {/* Empty state */}
                {orgData.profiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center animate-in fade-in duration-500">
                        <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
                            <Briefcase className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-display font-black tracking-tight">Sin profesionales disponibles</h2>
                            <p className="text-muted-foreground font-medium max-w-xs">
                                Aún no hay profesionales visibles en esta organización. Vuelve pronto.
                            </p>
                        </div>
                    </div>
                )}

                {/* Profiles grid */}
                {orgData.profiles.length > 0 && (
                    <div className={cn(
                        "grid gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200",
                        orgData.profiles.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
                            orgData.profiles.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" :
                                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    )}>
                        {orgData.profiles.map(profile => (
                            <ProfileCard key={profile.username} profile={profile} />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <footer className="flex flex-col items-center gap-3 pt-8 border-t border-border/50">
                    <div className="flex items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
                        <Logo className="h-5 w-5" />
                        <span className="text-sm font-display font-black tracking-tighter">VLINK</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                        Agenda inteligente para profesionales
                    </p>
                </footer>
            </main>
        </div>
    )
}
