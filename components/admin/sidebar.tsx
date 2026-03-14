"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Building2, Users, CreditCard, Settings, LogOut, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { signOut } from "@/lib/auth-client"

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/organizations", label: "Organizaciones", icon: Building2 },
        { href: "/admin/users", label: "Usuarios", icon: Users },
        { href: "/admin/plans", label: "Planes SaaS", icon: CreditCard },
        { href: "/admin/settings", label: "Configuración", icon: Settings },
    ]

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <div className="hidden lg:flex w-64 h-screen flex-col overflow-y-auto border-r border-primary/5 px-6 pb-6 bg-card sticky top-0">
            <div className="flex h-20 shrink-0 items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-display font-black tracking-tighter text-primary">VLink <span className="italic text-xs">admin</span></span>
                </div>
                <ThemeToggle />
            </div>

            <nav className="flex flex-1 flex-col mt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="space-y-1.5">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
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
                                                    layoutId="admin-sidebar-active"
                                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                                >
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                </motion.div>
                                            )}
                                            <item.icon className={cn(
                                                "h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                            )} aria-hidden="true" />
                                            <span className="relative z-10">{item.label}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto space-y-1">
                        <Link
                            href="/dashboard"
                            className="group relative flex gap-x-4 rounded-xl p-3 text-sm font-bold leading-6 transition-all duration-300 text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        >
                            <ExternalLink className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                            Ir al Dashboard
                        </Link>
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
