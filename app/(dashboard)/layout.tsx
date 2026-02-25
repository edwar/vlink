import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <aside className="w-64 hidden md:flex flex-col h-full sticky top-0">
                <DashboardSidebar />
            </aside>
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
