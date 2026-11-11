"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

// next-themes inyecta un <script> que aplica el tema antes de pintar (evita el parpadeo).
// Ese script se ejecuta desde el HTML del servidor; en el cliente React 19.2 avisa
// "Encountered a script tag while rendering React component". Marcándolo como
// application/json solo en el cliente se evita el aviso sin cambiar el comportamiento:
// el navegador ya ejecutó la versión del servidor y next-themes usa
// suppressHydrationWarning en ese <script>.
const scriptProps =
    typeof window === "undefined" ? undefined : ({ type: "application/json" } as const)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider scriptProps={scriptProps} {...props}>
            {children}
        </NextThemesProvider>
    )
}
