"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Building2, Users, CreditCard, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "../theme-toggle"
import { signOut } from "@/lib/auth-client"
import { Logo } from "../logo"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/organizations", label: "Organizaciones", icon: Building2 },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/plans", label: "Planes SaaS", icon: CreditCard },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
]

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        setIsOpen(false)
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
        <div className="lg:hidden shrink-0 z-50">
            {/* Header with Hamburger */}
            <header className="flex h-16 items-center justify-between border-b bg-card px-4 sticky top-0">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-display font-black tracking-tighter text-foreground uppercase">
                        VLink <span className="text-primary italic text-[10px] lowercase">admin</span>
                    </span>
                </div>
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
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="text-xl font-display font-black tracking-tighter text-foreground uppercase">
                            VLink <span className="text-primary italic text-[10px] lowercase">admin</span>
                        </span>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col p-6 overflow-y-auto">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    isActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                                    'group flex gap-x-3 rounded-md p-3 text-base font-semibold transition-colors'
                                                )}
                                            >
                                                <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>

                        <li className="mt-auto space-y-1">
                            <div className="flex items-center justify-between px-2 py-3 bg-muted/20 rounded-xl mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tema</span>
                                <ThemeToggle />
                            </div>

                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-base font-semibold text-muted-foreground hover:bg-accent transition-colors"
                            >
                                <ExternalLink className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Ir al Dashboard
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-base font-semibold text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
