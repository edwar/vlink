import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getPublicSystemConfig } from "@/app/actions/admin";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PaymentStatusWrapper } from "@/components/payment-status-wrapper";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await getPublicSystemConfig();

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
            <aside className="w-64 hidden lg:flex flex-col h-full sticky top-0 overflow-y-auto shrink-0 border-r border-border/40">
                <DashboardSidebar />
            </aside>
            <MobileNav />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {config?.announcementTitle && (
                    <div className={`shrink-0 px-4 py-2 md:px-6 md:py-3 flex items-center justify-between border-b gap-4 animate-in slide-in-from-top duration-500 shadow-none z-50 ${config.announcementType === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-700' :
                        config.announcementType === 'SUCCESS' ? 'bg-green-500/10 border-green-500/20 text-green-700' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-700'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block">
                                {config.announcementType === 'WARNING' ? <AlertTriangle className="h-4 w-4" /> :
                                    config.announcementType === 'SUCCESS' ? <CheckCircle2 className="h-4 w-4" /> :
                                        <Info className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                                <span className="text-xs font-black uppercase tracking-widest leading-none">{config.announcementTitle}</span>
                                {config.announcementBody && <span className="text-xs font-medium opacity-80 line-clamp-1">{config.announcementBody}</span>}
                            </div>
                        </div>
                    </div>
                )}
                <PaymentStatusWrapper />
                <main className="flex-1 overflow-y-auto px-4 py-8 pt-2 md:pt-20 lg:pt-0 md:px-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
