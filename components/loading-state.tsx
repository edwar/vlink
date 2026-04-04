"use client"

import Lottie from "lottie-react"
import calendarAnimation from "./animations/Calendar.json"
import { cn } from "@/lib/utils"

export function LoadingState({
    message = "Cargando...",
    fullPage = true
}: {
    message?: string,
    fullPage?: boolean
}) {
    const content = (
        <div className="relative w-full flex flex-col items-center justify-center gap-2">
            <div className={cn("w-[500px] h-[500px]", !fullPage && "w-[250px] h-[250px]")}>
                <Lottie
                    animationData={calendarAnimation}
                    loop={true}
                    autoplay={true}
                />
            </div>
            <p className={cn("absolute bottom-10 w-full text-center text-[24px] md:text-[48px] font-display font-black tracking-tighter leading-none text-primary", !fullPage && "text-[16px] md:text-[32px] bottom-0")}>{message}</p>
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
