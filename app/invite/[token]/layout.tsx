import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Invitación — VLink",
    description: "Acepta tu invitación para unirte a una organización en VLink.",
}

export default function InviteLayout({ children }: { children: React.ReactNode }) {
    return children
}
