import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { AdminMobileNav } from "@/components/admin/mobile-nav"

export default async function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Check if user is logged in and has ADMIN role
    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
            <Sidebar />
            <AdminMobileNav />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
