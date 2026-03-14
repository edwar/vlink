"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Users, CreditCard, Settings, LogOut, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/organizations", label: "Organizaciones", icon: Building2 },
        { href: "/admin/users", label: "Usuarios", icon: Users },
        { href: "/admin/plans", label: "Planes SaaS", icon: CreditCard },
        { href: "/admin/settings", label: "Configuración", icon: Settings },
    ]

    return (
        <aside className="hidden lg:flex w-64 border-r bg-card flex-col h-screen sticky top-0">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black">V</div>
                    <span className="font-display font-black tracking-tight text-xl uppercase">VLink <span className="text-primary italic text-xs">Admin</span></span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t space-y-2">
                <div className="px-4 py-2">
                    <ThemeToggle />
                </div>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                    <ExternalLink className="h-4 w-4" />
                    Ir al Dashboard
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}
