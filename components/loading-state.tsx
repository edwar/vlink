import { Loader2 } from "lucide-react"

export function LoadingState({
    message = "Cargando...",
    fullPage = true
}: {
    message?: string,
    fullPage?: boolean
}) {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <svg width="400" height="400" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                <rect width="220" height="220" rx="var(--radius-2xl)" fill="var(--background)" />

                <g transform="translate(40,40)">

                    <rect x="0" y="20" width="140" height="120" rx="var(--radius-lg)"
                        fill="var(--primary-foreground)"
                        stroke="var(--border)"
                        strokeWidth="2" />

                    <rect x="0" y="20" width="140" height="30" rx="var(--radius-lg)"
                        fill="var(--muted)" />

                    <circle cx="35" cy="20" r="6" fill="var(--muted)" />
                    <circle cx="105" cy="20" r="6" fill="var(--muted)" />

                    <g fill="var(--muted)">
                        <rect x="15" y="65" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                        </rect>
                        <rect x="45" y="65" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="75" y="65" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                        </rect>
                        <rect x="105" y="65" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                        </rect>

                        <rect x="15" y="90" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                        </rect>
                        <rect x="45" y="90" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="1s" repeatCount="indefinite" />
                        </rect>
                        <rect x="75" y="90" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="1.2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="105" y="90" width="20" height="15" rx="var(--radius-sm)">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="1.4s" repeatCount="indefinite" />
                        </rect>
                    </g>

                    <rect x="0" y="50" width="140" height="3"
                        fill="var(--ring)"
                        opacity="0.6">
                        <animate attributeName="y" values="50;130;50" dur="2s" repeatCount="indefinite" />
                    </rect>

                </g>

                <g transform="translate(110,110)">
                    <circle r="85"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="6" />
                    <circle r="85"
                        fill="none"
                        stroke="var(--muted-foreground)"
                        strokeWidth="6"
                        strokeDasharray="120 400"
                        strokeLinecap="round">
                        <animateTransform attributeName="transform"
                            type="rotate"
                            from="0"
                            to="360"
                            dur="1.5s"
                            repeatCount="indefinite" />
                    </circle>
                </g>

            </svg>
            <p className="text-[24px] md:text-[48px] font-display font-black tracking-tighter leading-none text-primary">{message}</p>
        </div>
    )

    if (fullPage) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                {content}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12">
            {content}
        </div>
    )
}
