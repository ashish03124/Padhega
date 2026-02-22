import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/app/lib/mongodb";
import User from "@/app/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        // GitHub OAuth Provider
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),

        // Email/Password Provider (for existing system)
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                try {
                    // Connect to database
                    await connectToDatabase();

                    // Find user by email
                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    });

                    if (!user) {
                        throw new Error("No account found with this email");
                    }

                    // Check if user has a password (might be OAuth-only)
                    if (!user.password && user.provider !== 'credentials') {
                        throw new Error(`Please use your ${user.provider} account to sign in`);
                    }

                    if (!user.password) {
                        throw new Error("Account configuration error: No password set");
                    }

                    // Compare password
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error: any) {
                    console.error("Auth error:", error);
                    throw new Error(error.message || "Authentication failed");
                }
            }
        }),
    ],

    // Use JWT for session strategy
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Custom pages
    pages: {
        signIn: '/', // Use custom modal instead of NextAuth default page
        error: '/',
    },

    // Callbacks
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider !== 'credentials') {
                    await connectToDatabase();

                    // Check if OAuth user exists
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create user for first-time OAuth login
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            provider: account?.provider,
                        });
                    }
                }
                return true;
            } catch (error) {
                console.error("SignIn callback error:", error);
                return true; // Still allow sign in, but log error
            }
        },

        async jwt({ token, user, account, trigger, session }) {
            // Function to safely inject correct image URL instead of raw base64
            const getSafeImageUrl = (imageSource: string, userId: string) => {
                if (imageSource && imageSource.startsWith('data:image')) {
                    // Cache buster ensures updates reflect immediately
                    return `/api/user/avatar?id=${userId}&v=${Date.now()}`;
                }
                return imageSource;
            };

            // If the user manually triggered a session update via `update()`
            if (trigger === "update" && session) {
                token.name = session.name;
                token.email = session.email;
                if (session.image !== undefined) {
                    token.image = getSafeImageUrl(session.image, token.id as string);
                }
            }

            // Add user info to token on sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                if (user.image) {
                    token.image = getSafeImageUrl(user.image, user.id);
                }
            }

            // Add OAuth provider info
            if (account) {
                token.provider = account.provider;
            }

            return token;
        },

        async session({ session, token }) {
            // Add token info to session
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.provider = token.provider as string;
                if (token.image) {
                    session.user.image = token.image as string;
                }
            }

            return session;
        },

        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
    },

    // Enable debug messages in development
    debug: process.env.NODE_ENV === 'development',

    // Secret for JWT encryption
    secret: process.env.NEXTAUTH_SECRET,
};
