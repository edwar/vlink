"use client"

import { useEffect, useState } from "react"
import { getOrgPaymentStatus } from "@/app/actions/billing"
import { PaymentRequiredBanner } from "./payment-required-banner"

export function PaymentStatusWrapper() {
    const [status, setStatus] = useState<{
        needsPaymentBanner: boolean
        planName: string
        daysRemaining: number | null
        endDate: number | null
    } | null>(null)

    useEffect(() => {
        getOrgPaymentStatus().then((data) => {
            if (data?.needsPaymentBanner) {
                setStatus(data)
            }
        })
    }, [])

    if (!status) return null

    return (
        <PaymentRequiredBanner
            planName={status.planName}
            daysRemaining={status.daysRemaining}
            endDate={status.endDate}
        />
    )
}
