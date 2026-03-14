"use client"

import { useEffect, useRef } from "react"
// import introJs from "intro.js" // Removed to fix SSR error
import "intro.js/introjs.css"
import { completeTour, shouldShowTour } from "@/app/actions/tour"

interface PageTourProps {
    pageKey: string
    version: string // format: YYYY-MM-DD
    steps: any[]
    onComplete?: () => void
}

export function PageTour({ pageKey, version, steps, onComplete }: PageTourProps) {
    const hasStarted = useRef(false)
    const tourRef = useRef<any>(null)

    useEffect(() => {
        let isStopped = false
        
        const initTour = async () => {
            const show = await shouldShowTour(pageKey, version)
            
            if (show && !hasStarted.current && !isStopped) {
                hasStarted.current = true
                
                // Small delay to ensure layout has settled
                await new Promise(resolve => setTimeout(resolve, 500))
                if (isStopped) return

                const introJs = (await import("intro.js")).default
                const tour = introJs()
                tourRef.current = tour
                
                tour.setOptions({
                    steps: steps,
                    showProgress: true,
                    showBullets: false,
                    showStepNumbers: false,
                    exitOnOverlayClick: false,
                    scrollToElement: false,
                    scrollPadding: 200,
                    nextLabel: 'Siguiente',
                    prevLabel: 'Anterior',
                    doneLabel: 'Entendido',
                    dontShowAgain: false,
                    tooltipClass: 'custom-tour-tooltip',
                    highlightClass: 'custom-tour-highlight',
                })

                tour.onbeforechange(async (targetElement: any) => {
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'auto', // Instant to prevent calculation offset
                            block: 'center',
                            inline: 'nearest'
                        });
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    return true
                })

                tour.onafterchange(() => {
                    // Small additional refreshes to ensure position is correct
                    setTimeout(() => tour.refresh(), 100);
                    setTimeout(() => tour.refresh(), 500);
                })

                tour.oncomplete(async () => {
                    await completeTour(pageKey, version)
                    onComplete?.()
                })

                tour.onexit(async () => {
                    await completeTour(pageKey, version)
                    onComplete?.()
                })

                if (!isStopped) {
                    tour.start()
                }
            }
        }

        initTour()

        return () => {
            isStopped = true
            if (tourRef.current) {
                tourRef.current.exit(true)
                tourRef.current = null
            }
            hasStarted.current = false
        }
    }, [pageKey, version, steps, onComplete])

    return null
}
