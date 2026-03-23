"use client"

import dynamic from "next/dynamic"
import { LoadingState } from "./loading-state"

const MarkdownManual = dynamic(() => import("./markdown-manual").then(mod => mod.MarkdownManual), {
    ssr: false,
    loading: () => (
        <LoadingState message="Cargando guía técnica..." fullPage />
    )
})

export function ManualClientWrapper({ content }: { content: string }) {
    return <MarkdownManual content={content} />
}
