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

                    const safeImage = (user.image && user.image.startsWith('data:image'))
                        ? `/api/user/avatar?id=${user._id}&v=${Date.now()}`
                        : user.image;

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: safeImage,
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
            const getSafeImageUrl = (imageSource: any, userId: string) => {
                if (!imageSource) return imageSource;
                
                const strSource = String(imageSource);
                // If it's a data URL or just a very long string, replace it with the API URL
                if (strSource.startsWith('data:image') || strSource.length > 500) {
                    return `/api/user/avatar?id=${userId}&v=${Date.now()}`;
                }
                return strSource;
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
                token.email = user.email;
                token.name = user.name;
                token.id = user.id;

                // For OAuth users, fetch the DB user to get the correct MongoDB _id and stored image
                if (account?.provider !== 'credentials') {
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.image = getSafeImageUrl(dbUser.image || user.image, token.id);
                    } else {
                        token.image = getSafeImageUrl(user.image, user.id);
                    }
                } else {
                    // user object from authorize
                    token.image = getSafeImageUrl(user.image, user.id);
                }
            }

            // Add OAuth provider info
            if (account) {
                token.provider = account.provider;
            }

            // FINAL SAFETY CHECK: If token.image is still huge for some reason, kill it
            if (token.image && String(token.image).length > 1000) {
                console.error("CRITICAL: Token image still huge after sanitization. Stripping it.");
                token.image = token.id ? `/api/user/avatar?id=${token.id}` : null;
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
