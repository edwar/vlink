"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Clock, Settings, User, LogOut, LayoutDashboard, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { signOut } from "@/lib/auth-client"
import { ProfileSwitcher } from "./profile-switcher"

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

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-card border-r px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
                <span className="text-2xl font-display font-bold tracking-tight text-primary">VLink</span>
                <ThemeToggle />
            </div>

            <ProfileSwitcher />

            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            pathname === item.href
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors'
                                        )}
                                    >
                                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={handleSignOut}
                            className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
