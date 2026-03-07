"use client"

import { useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Printer, QrCode, Copy, Check } from "lucide-react"
import { Logo } from "@/components/logo"
import { sileo } from "sileo"

interface OrgQRCodeProps {
    orgName: string
    orgSlug: string
    appUrl: string
}

export function OrgQRCode({ orgName, orgSlug, appUrl }: OrgQRCodeProps) {
    const [copied, setCopied] = useState(false)
    const qrRef = useRef<HTMLDivElement>(null)

    const publicUrl = `${appUrl}/org/${orgSlug}`

    const downloadQR = () => {
        const svgElement = qrRef.current?.querySelector("svg")
        if (!svgElement) return

        // Scale relative to QR size
        const size = parseInt(svgElement.getAttribute("width") || "180", 10)
        const viewBox = svgElement.getAttribute("viewBox") || `0 0 ${size} ${size}`
        const padding = Math.floor(size * 0.15)
        const squareSize = size + padding * 2

        const topMargin = Math.floor(size * 0.08)

        // Extract the inner content of the QR code SVG
        const qrSVGContent = svgElement.innerHTML
        const nameFontSize = Math.floor(size * 0.08)
        const urlFontSize = Math.floor(size * 0.05)

        // Assemble a standalone SVG document
        const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="${squareSize}" height="${squareSize}" viewBox="0 0 ${squareSize} ${squareSize}">
    <!-- Background -->
    <rect width="${squareSize}" height="${squareSize}" rx="${size * 0.1}" fill="#ffffff" />
    
    <!-- QR Code Group -->
    <svg x="${padding}" y="${topMargin}" width="${size}" height="${size}" viewBox="${viewBox}">
        ${qrSVGContent}
    </svg>
    
    <!-- Text Elements -->
    <text x="${squareSize / 2}" y="${topMargin + size + nameFontSize * 1.5}" 
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${nameFontSize}px" 
          font-weight="bold" 
          fill="#111827" 
          text-anchor="middle">
        ${orgName}
    </text>
    
    <text x="${squareSize / 2}" y="${topMargin + size + nameFontSize * 1.5 + urlFontSize * 1.5}" 
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="${urlFontSize}px" 
          font-weight="bold" 
          fill="#6b7280" 
          text-anchor="middle">
        ${publicUrl.replace(/^https?:\/\//, "")}
    </text>
</svg>`.trim()

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        // Download as pure SVG
        link.download = `qr-${orgSlug}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        sileo.success({ title: "QR descargado", description: "Es un vector SVG listo para imprimir a cualquier tamaño." })
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(publicUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        sileo.success({ title: "Enlace copiado", description: publicUrl })
    }

    const shareLink = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `Agenda con ${orgName}`,
                text: `Agenda tu cita con los profesionales de ${orgName}`,
                url: publicUrl
            })
        } else {
            copyLink()
        }
    }

    return (
        <div className="space-y-6">
            {/* QR Code display */}
            <div className="flex flex-col items-center gap-5">
                <div
                    className="relative p-5 rounded-3xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 group transition-transform hover:scale-[1.02] duration-300"
                    ref={qrRef}
                >
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 h-5 w-5 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 h-5 w-5 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />

                    <QRCodeSVG
                        value={publicUrl}
                        size={180}
                        level="H"
                        marginSize={1}
                        imageSettings={{
                            src: "/icon.svg",
                            height: 36,
                            width: 36,
                            excavate: true,
                        }}
                    />
                </div>

                {/* URL display */}
                <div className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border flex items-center gap-2 overflow-hidden">
                    <QrCode className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-[11px] font-mono font-bold text-muted-foreground truncate flex-1">
                        {publicUrl.replace(/^https?:\/\//, "")}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={downloadQR}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 group"
                >
                    <Download className="w-8 h-8 md:h-5 md:w-5 lg:w-12 lg:h-12 xl:w-5 xl:h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] hidden md:block lg:hidden xl:block font-black uppercase tracking-widest">Descargar</span>
                </button>

                <button
                    onClick={copyLink}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border-2 border-border hover:border-primary/20 hover:bg-accent active:scale-95 transition-all group"
                >
                    {copied
                        ? <Check className="w-8 h-8 md:h-5 md:w-5 lg:w-12 lg:h-12 xl:w-5 xl:h-5 text-green-500" />
                        : <Copy className="w-8 h-8 md:h-5 md:w-5 lg:w-12 lg:h-12 xl:w-5 xl:h-5 group-hover:scale-110 transition-transform" />
                    }
                    <span className="text-[10px] hidden md:block lg:hidden xl:block font-black uppercase tracking-widest">
                        {copied ? "¡Copiado!" : "Copiar"}
                    </span>
                </button>

                <button
                    onClick={shareLink}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border-2 border-border hover:border-primary/20 hover:bg-accent active:scale-95 transition-all group"
                >
                    <Share2 className="w-8 h-8 md:h-5 md:w-5 lg:w-12 lg:h-12 xl:w-5 xl:h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] hidden md:block lg:hidden xl:block font-black uppercase tracking-widest">Compartir</span>
                </button>
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center font-medium leading-relaxed">
                El QR lleva directamente a la página pública donde tus clientes pueden elegir un profesional y agendar su cita.
            </p>
        </div>
    )
}
