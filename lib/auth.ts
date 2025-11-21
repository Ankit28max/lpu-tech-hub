// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await dbConnect();

                try {
                    // Check if user exists
                    let existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create new user with Google OAuth
                        existingUser = await User.create({
                            username: user.email?.split('@')[0] || `user_${Date.now()}`,
                            email: user.email,
                            googleId: account.providerAccountId,
                            provider: 'google',
                            emailVerified: new Date(),
                            avatar: user.image || '',
                            bio: '',
                            skills: [],
                            following: [],
                            followers: [],
                        });
                    } else if (!existingUser.googleId) {
                        // Link Google account to existing email/password account
                        existingUser.googleId = account.providerAccountId;
                        existingUser.emailVerified = new Date();
                        await existingUser.save();
                    }

                    return true;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                    return false;
                }
            }

            return true;
        },

        async session({ session, token }) {
            if (session.user && session.user.email) {
                await dbConnect();
                const dbUser = await User.findOne({ email: session.user.email });

                if (dbUser) {
                    // Extend session user with additional fields
                    session.user = {
                        ...session.user,
                        id: dbUser._id.toString(),
                        username: dbUser.username,
                        avatar: dbUser.avatar,
                    };
                }
            }

            return session;
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }

            return token;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: 'jwt',
    },

    secret: process.env.NEXTAUTH_SECRET,
};
