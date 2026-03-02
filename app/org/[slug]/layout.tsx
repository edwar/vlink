import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Organización — VLink",
    description: "Explora los profesionales de esta organización y agenda tu cita.",
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
    return children
}
