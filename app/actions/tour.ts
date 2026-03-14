"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Action to check and complete tours

/**
 * Checks if a tour for a specific page should be shown to the user.
 * A tour is shown if:
 * 1. The user has never seen it for this page.
 * 2. OR the current tour version is newer than when they last completed it.
 */
export async function shouldShowTour(pageKey: string, currentTourVersion: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) return false;

        const progress = await prisma.tourProgress.findUnique({
            where: {
                userId_pageKey: {
                    userId: session.user.id,
                    pageKey
                }
            }
        });

        if (!progress) return true;

        const currentVersionDate = new Date(currentTourVersion);
        return progress.tourVersion < currentVersionDate;
    } catch (error) {
        console.error("Error checking tour progress:", error);
        return false;
    }
}

/**
 * Marks a tour as completed for the current user and page.
 */
export async function completeTour(pageKey: string, tourVersion: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) throw new Error("No autenticado");

        const tourVersionDate = new Date(tourVersion);
        
        if (isNaN(tourVersionDate.getTime())) {
            console.error(`[Tour] Versión de tour inválida recibida: ${tourVersion}`);
            return { success: false, error: "Versión de tour inválida" };
        }

        await prisma.tourProgress.upsert({
            where: {
                userId_pageKey: {
                    userId: session.user.id,
                    pageKey
                }
            },
            update: {
                completedAt: new Date(),
                tourVersion: tourVersionDate
            },
            create: {
                userId: session.user.id,
                pageKey,
                tourVersion: tourVersionDate
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error completing tour:", error);
        return { success: false };
    }
}
