"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, CreditCard, Sparkles } from "lucide-react"
import { sileo } from "sileo"

import type { Organization } from "@prisma/client"

interface OrgBusinessCardProps {
    organization: Organization
    publicUrl: string
}

export function OrgBusinessCard({ organization, publicUrl }: OrgBusinessCardProps) {
    const orgName = organization.name
    const orgSlug = organization.slug
    const qrRef = useRef<HTMLDivElement>(null)

    const downloadBusinessCard = () => {
        const svgElement = qrRef.current?.querySelector("svg")
        if (!svgElement) return

        const viewBox = svgElement.getAttribute("viewBox") || "0 0 29 29"
        const qrSVGContent = svgElement.innerHTML

        // Standard business card is 3.5x2 inches -> roughly 1050x600 pixels layout
        const width = 1050
        const height = 600

        // Assemble a standalone SVG document 
        const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
        <linearGradient id="vlinkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#09090b" />
            <stop offset="100%" stop-color="#3f3f46" />
        </linearGradient>
        <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="#e2e8f0" />
        </pattern>
        <linearGradient id="fadeGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
    </defs>
    
    <!-- Shadows & Background -->
    <rect width="${width}" height="${height}" fill="#f8fafc" />
    <rect width="${width}" height="${height}" fill="url(#dotPattern)" opacity="0.6" />
    
    <!-- White Card Container Fill -->
    <rect width="${width - 120}" height="${height - 120}" x="60" y="60" rx="30" fill="#ffffff" />
    
    <!-- Left Color Accent perfectly crafted as a path overlapping exact corners (30px wide) -->
    <path d="M 90 60 A 30 30 0 0 0 60 90 V 510 A 30 30 0 0 0 90 540 Z" fill="url(#vlinkGradient)" />
    
    <!-- Fade Section behind QR crafted as a path covering the exact right corners -->
    <path d="M 540 60 H 960 A 30 30 0 0 1 990 90 V 510 A 30 30 0 0 1 960 540 H 540 Z" fill="url(#fadeGradient)" />
    
    <!-- Card Border (drawn on top of fills to maintain crispness) -->
    <rect width="${width - 120}" height="${height - 120}" x="60" y="60" rx="30" fill="none" stroke="#e2e8f0" stroke-width="2" />
    
    <!-- Organization Info -->
    <text x="140" y="240" font-family="system-ui, -apple-system, BlinkMacSystemFont, Tahoma, sans-serif" font-size="70px" font-weight="900" fill="#0f172a">
        ${orgName}
    </text>
    
    <text x="140" y="300" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="32px" font-weight="600" fill="#64748b">
        Agenda tu cita con nosotros
    </text>

    <!-- Footer / VLink Branding -->
    <text x="140" y="460" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="20px" font-weight="800" text-transform="uppercase" letter-spacing="2" fill="#94a3b8">
        Tecnología de VLink
    </text>
    <text x="140" y="495" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="26px" font-weight="bold" fill="#18181b">
        ${publicUrl.replace(/^https?:\/\//, "")}
    </text>
    
    <!-- Big QR Code Area protagonist -->
    <rect width="380" height="380" rx="40" x="570" y="110" fill="#ffffff" stroke="#f1f5f9" stroke-width="8" />
    
    <svg x="600" y="140" width="320" height="320" viewBox="${viewBox}">
        ${qrSVGContent}
    </svg>
</svg>`.trim()

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = `tarjeta-${orgSlug}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        sileo.success({ title: "Tarjeta descargada", description: "El diseño vectorial (SVG) está listo para imprenta." })
    }

    return (
        <div className="w-full">
            <div className="hidden" ref={qrRef}>
                <QRCodeSVG
                    value={publicUrl}
                    size={260}
                    level="H"
                    marginSize={0}
                    imageSettings={{
                        src: "/icon.svg",
                        height: 50,
                        width: 50,
                        excavate: true,
                    }}
                />
            </div>
            <div className="group relative">
                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl group-hover:bg-primary/20 transition-all duration-500 opacity-50" />

                <div className="relative overflow-hidden w-full aspect-1.75/1 rounded-[2rem] bg-white border border-primary/10 shadow-xl shadow-primary/5 flex transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]" />
                    <div className="w-2 md:w-3 h-full bg-slate-900 relative z-10" />

                    <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col justify-center relative z-10 min-w-0">
                        <div className="space-y-2 md:space-y-3">
                            <div>
                                <h3 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-display text-slate-800 tracking-tighter leading-tight line-clamp-2">
                                    {orgName}
                                </h3>
                                <p className="text-[8px] md:text-sm lg:text-base font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                                    Agenda tu cita
                                </p>
                            </div>

                            <div className="space-y-0.5 pt-2 md:pt-4 lg:pt-6 mt-1 border-t border-slate-100">
                                <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Tecnología de VLink
                                </p>
                                <p className="text-[10px] md:text-sm lg:text-base xl:text-lg font-bold text-primary truncate">
                                    {publicUrl.replace(/^https?:\/\//, "")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-2 md:gap-4 relative z-10 bg-linear-to-l from-white via-white to-transparent">
                        <div className="bg-white p-2 md:p-4 rounded-[1rem] lg:rounded-[2rem] shadow-lg border-[4px] md:border-[6px] border-slate-50">
                            <QRCodeSVG
                                value={publicUrl}
                                size={400}
                                level="H"
                                marginSize={0}
                                className="w-8 h-8 sm:w-20 sm:h-20 md:w-30 md:h-30 lg:w-40 lg:h-40"
                                imageSettings={{
                                    src: "/icon.svg",
                                    height: 50,
                                    width: 50,
                                    excavate: true,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-black/10 backdrop-blur-2xs lg:bg-black/20 lg:backdrop-blur-sm rounded-[2rem] opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 hover:scale-[1.02]">
                    <button
                        onClick={downloadBusinessCard}
                        className="flex items-center gap-2 px-2 py-2 lg:px-6 lg:py-3 rounded-2xl bg-primary-foreground text-primary hover:scale-105 active:scale-95 transition-all shadow-xl font-black uppercase text-xs tracking-widest"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden lg:block">Descargar como SVG</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
