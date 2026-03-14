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
            <header className="flex h-16 items-center justify-between border-b bg-card px-4 sticky top-0 z-50">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle navigation"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Menu Overlay */}
            {isOpen && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-50 bg-background/30 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                    <ThemeToggle />
                </div>
                <div className="px-1 border-b">
                    <ProfileSwitcher />
                </div>
                <div className="px-1 py-3 border-b">
                    <PlanBadge />
                </div>

                <nav className="flex flex-1 flex-col p-6 overflow-y-auto">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="space-y-1">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                pathname === item.href
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                                'group flex gap-x-3 rounded-md p-3 text-base font-semibold transition-colors'
                                            )}
                                        >
                                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="mt-auto space-y-1">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        pathname.startsWith('/admin')
                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm'
                                            : 'text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600',
                                        'group flex gap-x-3 rounded-md p-3 text-base font-semibold transition-colors'
                                    )}
                                >
                                    <ShieldCheck className={cn(
                                        "h-6 w-6 shrink-0",
                                        pathname.startsWith('/admin') ? "text-amber-600" : "text-muted-foreground"
                                    )} aria-hidden="true" />
                                    VLink Admin
                                </Link>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="group flex w-full gap-x-3 rounded-md p-3 text-base font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
