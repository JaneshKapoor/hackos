import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        EmailProvider({
            server: {
                host: "smtp.resend.com",
                port: 465,
                auth: {
                    user: "resend",
                    pass: process.env.RESEND_API_KEY || "",
                },
            },
            from: "Hackos <onboarding@resend.dev>",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    // Only host@hackos.app gets HOST role, everyone else is PARTICIPANT
                    const role = credentials.email === "host@hackos.app" ? "HOST" : "PARTICIPANT";
                    const newUser = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.email.split("@")[0],
                            role,
                        },
                    });
                    return {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role,
                    };
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
};

export default authOptions;
