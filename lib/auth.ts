import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                input: false, // prevent users from providing this during sign up
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            scope: ["openid", "profile", "email", "https://www.googleapis.com/auth/calendar.events"],
            prompt: "consent",
            accessType: "offline",
        },
    },
    // Adding profile creation on user creation
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Derive base username from email prefix
                    const base = user.email
                        .split('@')[0]
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, "") // Only allow valid URL chars
                        || "user"

                    // Find a unique username: base, base2, base3...
                    let username = base
                    let counter = 2
                    while (await prisma.profile.findUnique({ where: { username } })) {
                        username = `${base}${counter++}`
                    }

                    await prisma.profile.create({
                        data: {
                            userId: user.id,
                            username,
                        }
                    });
                }
            }
        }
    }
});
