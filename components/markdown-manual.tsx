"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Printer, ArrowLeft, Download } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"


export function MarkdownManual({ content }: { content: string }) {
    const { data: session } = useSession()

    const handleDownloadPdf = () => {
        window.print()
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20 animate-in fade-in duration-1000">
            {/* Action Bar (Hid on print) */}
            <div className="print:hidden flex items-center justify-between mb-12 border-b border-border/40 pb-6">
                <Link
                    href={session ? "/dashboard" : "/"}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {session ? "Volver al Dashboard" : "Volver al Inicio"}
                </Link>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleDownloadPdf}
                        variant="default"
                        size="sm"
                        className="rounded-full px-5 font-black uppercase text-[10px] tracking-widest shadow-xl bg-primary text-white"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                    </Button>
                </div>
            </div>

            {/* Markdown Container */}
            <div className="prose prose-zinc dark:prose-invert max-w-none 
                prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-headings:text-primary
                prose-img:rounded-4xl prose-img:border prose-img:border-border/40 prose-img:shadow-2xl prose-img:my-10
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
                prose-strong:text-foreground prose-strong:font-black
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:p-6 prose-blockquote:not-italic
                prose-ul:text-muted-foreground prose-ul:space-y-2
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                print:prose-p:text-sm print:prose-headings:mt-4 print:prose-img:my-4 print:prose-img:max-h-[300px] print:m-0 print:p-0
            ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-10 border-t border-border/40 text-center print:hidden">
                <p className="text-muted-foreground text-sm font-medium">
                    © {new Date().getFullYear()} VLink - Todos los derechos reservados.
                </p>
                <div className="mt-4 flex justify-center gap-8">
                    <Link href="/terminos" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Términos</Link>
                    <Link href="/privacidad" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Politicas de Privacidad</Link>
                    <Link href="/soporte" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Soporte</Link>
                </div>
            </footer>
        </div>
    )
}
