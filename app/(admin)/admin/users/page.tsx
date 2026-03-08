import { getAllUsers } from "@/app/actions/admin"
import { Users, ShieldCheck, Mail, Calendar, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default async function AdminUsers() {
    const users = await getAllUsers()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-display font-black tracking-tight text-foreground uppercase">Usuarios del Sistema</h1>
                <p className="text-muted-foreground font-medium">Gestión global de cuentas de usuario y niveles de acceso.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="border-none shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-shadow bg-card overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Users className="h-7 w-7" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black font-display tracking-tight text-foreground">{user.name}</h3>
                                            {(user as any).role === "ADMIN" && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                                            <Mail className="h-3 w-3" /> {user.email}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                                                {user.memberships.length} Orgs
                                            </span>
                                            {user.profile && (
                                                <Link
                                                    href={`/${user.profile.username}`}
                                                    target="_blank"
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                                >
                                                    @{user.profile.username} <ArrowUpRight className="h-2.5 w-2.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-right shrink-0">
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Registrado</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {format(new Date(user.createdAt), "d MMM, yyyy", { locale: es })}
                                        </p>
                                    </div>

                                    <button className="h-12 w-12 bg-muted/40 text-muted-foreground rounded-2xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
                                        <ShieldCheck className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
