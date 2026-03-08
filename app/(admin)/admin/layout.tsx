import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"

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
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
