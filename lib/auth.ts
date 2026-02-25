import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    // Adding profile creation on user creation
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.profile.create({
                        data: {
                            userId: user.id,
                            username: user.email.split('@')[0] + Math.random().toString(36).slice(-4), // Simple unique username generation
                        }
                    });
                }
            }
        }
    }
});
