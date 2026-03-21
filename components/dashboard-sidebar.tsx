"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Clock, Settings, User, LogOut, LayoutDashboard, Users, ShieldCheck, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { ProfileSwitcher } from "./profile-switcher"
import { Logo } from "./logo"
import { useProfileStore } from "@/lib/store/profile-store"
import { PlanBadge } from "./plan-badge"
import { motion } from "framer-motion"

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Disponibilidad', href: '/dashboard/disponibilidad', icon: Clock },
    { name: 'Equipo', href: '/dashboard/organizacion', icon: Users },
    { name: 'Perfil', href: '/dashboard/perfil', icon: User },
    { name: 'Manual', href: '/manual', icon: BookOpen },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const clearProfile = useProfileStore((state) => state.clearProfile)
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"

    const handleSignOut = async () => {
        clearProfile()
        await signOut()
        router.push("/")
    }

    return (
        <div className="flex h-dvh flex-col gap-y-6 overflow-y-auto border-r border-primary/5 px-6 pb-6">
            <div className="flex h-20 shrink-0 items-center justify-between">
                <div id="tour-logo" className="flex items-center gap-2 group cursor-pointer">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                </div>
                <ThemeToggle />
            </div>

            <ProfileSwitcher />

            <PlanBadge />

            <nav id="tour-nav" className="flex flex-1 flex-col mt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="space-y-1.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'group relative flex gap-x-4 rounded-md p-3 text-sm font-bold leading-6 transition-colors duration-300 overflow-hidden',
                                                isActive
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 bg-primary/10 rounded-xl shadow-none"
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
                                className={cn(
                                    pathname.startsWith('/admin')
                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none'
                                        : 'text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600',
                                    'group relative flex gap-x-4 rounded-xl p-3 text-sm font-bold leading-6 transition-all duration-300'
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
                            className="group flex w-full gap-x-4 rounded-xl p-3 text-sm font-bold leading-6 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                        >
                            <LogOut className="h-6 w-6 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
