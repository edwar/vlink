"use client"

import Lottie from "lottie-react"
import calendarAnimation from "./animations/Calendar.json"

export function LoadingState({
    message = "Cargando...",
    fullPage = true
}: {
    message?: string,
    fullPage?: boolean
}) {
    const content = (
        <div className="relative w-full flex flex-col items-center justify-center gap-2">
            <div className="w-[500px] h-[500px]">
                <Lottie
                    animationData={calendarAnimation}
                    loop={true}
                    autoplay={true}
                />
            </div>
            <p className="absolute bottom-10 w-full text-center text-[24px] md:text-[48px] font-display font-black tracking-tighter leading-none text-primary">{message}</p>
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
