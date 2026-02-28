"use client"

import Link from "next/link"
import { useSession } from "@/lib/auth-client"

interface AuthCTAProps {
    /** Content shown when user is NOT logged in */
    children: React.ReactNode
    /** Content shown when user IS logged in */
    loggedInChildren?: React.ReactNode
    className?: string
    loginHref?: string
    dashboardHref?: string
}

/**
 * A CTA component that navigates to the dashboard if the user
 * has an active session, or to the login page if not.
 * Supports different text/content for each state.
 */
export function AuthCTA({
    children,
    loggedInChildren,
    className,
    loginHref = "/login",
    dashboardHref = "/dashboard",
}: AuthCTAProps) {
    const { data: session } = useSession()

    const isLoggedIn = !!session?.user
    const href = isLoggedIn ? dashboardHref : loginHref

    return (
        <Link href={href} className={className}>
            {isLoggedIn && loggedInChildren ? loggedInChildren : children}
        </Link>
    )
}
