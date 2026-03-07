"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Clock, Settings, User, LogOut, LayoutDashboard, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { signOut } from "@/lib/auth-client"
import { ProfileSwitcher } from "./profile-switcher"
import Image from "next/image"
import { Logo } from "./logo"
import { useProfileStore } from "@/lib/store/profile-store"

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Disponibilidad', href: '/dashboard/disponibilidad', icon: Clock },
    { name: 'Equipo', href: '/dashboard/organizacion', icon: Users },
    { name: 'Perfil', href: '/dashboard/perfil', icon: User },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const clearProfile = useProfileStore((state) => state.clearProfile)

    const handleSignOut = async () => {
        clearProfile()
        await signOut()
        router.push("/")
    }

    return (
        <div className="flex h-full flex-col gap-y-6 overflow-y-auto bg-card border-r border-primary/5 px-6 pb-6">
            <div className="flex h-20 shrink-0 items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink</span>
                </div>
                <ThemeToggle />
            </div>

            <ProfileSwitcher />

            <nav className="flex flex-1 flex-col mt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                                'group relative flex gap-x-4 rounded-xl p-3 text-sm font-bold leading-6 transition-all duration-300'
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
                                            )}
                                            <item.icon className={cn(
                                                "h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                            )} aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={handleSignOut}
                            className="group -mx-2 flex w-full gap-x-4 rounded-xl p-3 text-sm font-bold leading-6 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
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
