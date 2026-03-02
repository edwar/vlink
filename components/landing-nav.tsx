"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, LogOut } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function LandingNav() {
    const [menuOpen, setMenuOpen] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement>(null)

    const isLoggedIn = !!session?.user

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [menuOpen])

    // Prevent scrolling when menu is open (mobile only)
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [menuOpen])

    const handleSignOut = async () => {
        setMenuOpen(false)
        await signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Logo className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl sm:text-2xl font-display font-black tracking-tighter">VLINK</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden sm:flex items-center gap-3">
                    <ThemeToggle />
                    {isLoggedIn && (
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground border border-border/60 hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Salir
                        </button>
                    )}
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/login"}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                    >
                        {isLoggedIn ? "Ir al Dashboard" : "Empezar ahora"}
                    </Link>
                </div>

                {/* Mobile Nav */}
                <div className="flex sm:hidden items-center" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Menú principal"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    {/* Dropdown / Menu Overlay */}
                    {menuOpen && (
                        <>
                            <div
                                role="presentation"
                                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
                                onClick={() => setMenuOpen(false)}
                                onKeyDown={() => setMenuOpen(false)}
                            />
                            <div className="absolute top-full right-4 mt-2 w-56 bg-card border border-border/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Dashboard / Empezar */}
                                <Link
                                    href={isLoggedIn ? "/dashboard" : "/login"}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                                >
                                    {isLoggedIn ? "Ir al dashboard" : "Empezar ahora"}
                                </Link>

                                {/* Divider */}
                                <div className="my-1 border-t border-border/40" />

                                {/* Theme Toggle */}
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl">
                                    <span className="text-sm font-semibold text-muted-foreground">Tema</span>
                                    <ThemeToggle />
                                </div>

                                {/* Sign Out (only when logged in) */}
                                {isLoggedIn && (
                                    <>
                                        <div className="my-1 border-t border-border/40" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Cerrar sesión
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
