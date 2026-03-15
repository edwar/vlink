"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Calendar, Clock, User, Settings, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { ProfileSwitcher } from "./profile-switcher"
import { Users } from "lucide-react"
import { Logo } from "./logo"
import { PlanBadge } from "./plan-badge"
import { motion } from "framer-motion"

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Disponibilidad', href: '/dashboard/disponibilidad', icon: Clock },
    { name: 'Equipo', href: '/dashboard/organizacion', icon: Users },
    { name: 'Perfil', href: '/dashboard/perfil', icon: User },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <div className="lg:hidden">
            {/* Header with Hamburger */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5 px-4 flex h-16 items-center justify-between">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                <button
                    id="tour-mobile-nav-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle navigation"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Menu Overlay */}
            {
                isOpen && (
                    <div
                        role="presentation"
                        className="fixed inset-0 z-50 bg-background/30 backdrop-blur-xs animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                        onKeyDown={() => setIsOpen(false)}
                    />
                )
            }

            {/* Side Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-none transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                    <ThemeToggle />
                </div>
                <div className="px-1 border-b">
                    <ProfileSwitcher onClick={() => setIsOpen(false)} />
                </div>
                <div className="px-1 py-3 border-b">
                    <PlanBadge onClick={() => setIsOpen(false)} />
                </div>

                <nav className="flex flex-1 flex-col px-6 py-4 overflow-y-auto">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="space-y-1.5">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    'group relative flex gap-x-4 rounded-md p-3 text-sm font-bold leading-6 transition-colors duration-300 overflow-hidden',
                                                    isActive
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="mobile-nav-active"
                                                        className="absolute inset-0 bg-primary/10 rounded-md shadow-none"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                                    >
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                    </motion.div>
                                                )}
                                                <item.icon className={cn(
                                                    "h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                )} aria-hidden="true" />
                                                <span className="relative z-10">{item.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                        <li className="mt-auto space-y-1">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        pathname.startsWith('/admin')
                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none'
                                            : 'text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600',
                                        'group relative flex gap-x-4 rounded-md p-3 text-sm font-bold leading-6 transition-all duration-300'
                                    )}
                                >
                                    <ShieldCheck className={cn(
                                        "h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110",
                                        pathname.startsWith('/admin') ? "text-amber-600" : "text-muted-foreground group-hover:text-amber-600"
                                    )} aria-hidden="true" />
                                    VLink Admin
                                </Link>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="group flex w-full gap-x-4 rounded-md p-3 text-sm font-bold leading-6 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                            >
                                <LogOut className="h-6 w-6 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div >
    )
}
