"use client"

import dynamic from "next/dynamic"

const MarkdownManual = dynamic(() => import("./markdown-manual").then(mod => mod.MarkdownManual), {
    ssr: false,
    loading: () => (
        <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse uppercase tracking-widest text-xs">Cargando guía técnica...</p>
        </div>
    )
})

export function ManualClientWrapper({ content }: { content: string }) {
    return <MarkdownManual content={content} />
}
