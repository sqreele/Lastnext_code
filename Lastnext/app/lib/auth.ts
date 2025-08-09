import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { UserProfile, Property } from "@/app/lib/types";
import { getUserProperties } from "./prisma-user-property";
import { unstable_cache } from 'next/cache';
import { memoizeRequest } from './request-cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://pmcs.site");

// Token refresh with retry logic and caching
async function refreshAccessToken(refreshToken: string, retryCount = 0): Promise<any> {
  const maxRetries = 2;
  
  try {
    console.log(`[NextAuth] Attempting token refresh (attempt ${retryCount + 1})`);
    
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const refreshedTokens = await response.json();
    if (!refreshedTokens.access) {
      throw new Error('Refresh response missing access token');
    }

    // Decode new token to get expiry
    const decoded = jwt.decode(refreshedTokens.access) as JwtPayload;
    const accessTokenExpires = decoded?.exp ? decoded.exp * 1000 : Date.now() + 60 * 60 * 1000;

    console.log("[NextAuth] Token refreshed successfully");
    return {
      accessToken: refreshedTokens.access,
      refreshToken: refreshedTokens.refresh || refreshToken,
      accessTokenExpires: accessTokenExpires,
    };
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`[NextAuth] Token refresh failed, retrying... (${retryCount + 1}/${maxRetries})`);
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return refreshAccessToken(refreshToken, retryCount + 1);
    }
    
    console.error('[NextAuth] Token refresh error after retries:', error);
    return {
      error: 'RefreshAccessTokenError',
    };
  }
}

// Cache user profile fetching
const getCachedUserProfile = unstable_cache(
  async (userId: string, accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profiles/${userId}/`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          "Content-Type": "application/json" 
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  },
  ['user-profile'],
  { revalidate: 300 } // Cache for 5 minutes
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials.");
        }

        // Memoize the authorization request for the same credentials
        return memoizeRequest(
          `auth-${credentials.username}`,
          async () => {
            try {
              // Get authentication tokens from API with timeout
              const tokenResponse = await fetch(`${API_BASE_URL}/api/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
                signal: AbortSignal.timeout(10000), // 10 second timeout
              });

              if (!tokenResponse.ok) {
                throw new Error("Invalid credentials.");
              }

              const tokenData = await tokenResponse.json();
              if (!tokenData.access || !tokenData.refresh) {
                throw new Error("Token response missing access or refresh token.");
              }

              // Decode JWT token to get user ID and expiry
              const decoded = jwt.decode(tokenData.access) as JwtPayload;
              if (!decoded || typeof decoded !== "object" || !decoded.user_id) {
                throw new Error("Failed to decode access token.");
              }

              const userId = String(decoded.user_id);
              const accessTokenExpires = decoded.exp ? decoded.exp * 1000 : Date.now() + 60 * 60 * 1000;

              // Parallel fetch of user data and profile
              const [user, profileData] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                getCachedUserProfile(userId, tokenData.access)
              ]);

              // Create or update user in database
              const finalUser = await prisma.user.upsert({
                where: { id: userId },
                update: {
                  username: credentials.username,
                  email: profileData?.email || null,
                  profile_image: profileData?.profile_image || null,
                  positions: profileData?.positions || "User",
                  updated_at: new Date(),
                },
                create: {
                  id: userId,
                  username: credentials.username,
                  email: profileData?.email || null,
                  profile_image: profileData?.profile_image || null,
                  positions: profileData?.positions || "User",
                  created_at: new Date(),
                },
              });

              // Get properties (cached in database)
              let normalizedProperties: Property[] = [];
              if (profileData?.properties && profileData.properties.length > 0) {
                normalizedProperties = profileData.properties.map((prop: any) => ({
                  id: String(prop.id),
                  property_id: String(prop.property_id || prop.id),
                  name: prop.name || `Property ${prop.id}`,
                  description: prop.description || "",
                  created_at: prop.created_at || new Date().toISOString(),
                  users: prop.users || [],
                }));
              } else {
                // Fallback to database properties
                normalizedProperties = await getUserProperties(userId);
              }

              const userProfile: UserProfile = {
                id: userId,
                username: credentials.username,
                email: finalUser.email || profileData?.email || null,
                profile_image: finalUser.profile_image || profileData?.profile_image || null,
                positions: finalUser.positions || profileData?.positions || "User",
                properties: normalizedProperties,
                created_at: finalUser.created_at.toISOString() || profileData?.created_at || new Date().toISOString(),
              };

              return {
                ...userProfile,
                accessToken: tokenData.access,
                refreshToken: tokenData.refresh,
                accessTokenExpires: accessTokenExpires,
              };
            } catch (error) {
              console.error("Authorization Error:", error);
              throw new Error("Unable to log in. Please check your credentials.");
            }
          }
        );
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.profile_image = user.profile_image;
        token.positions = user.positions;
        token.properties = Array.isArray(user.properties) ? user.properties : [];
        token.created_at = user.created_at;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      // Return previous token if the access token has not expired yet
      // Add 5 minute buffer before expiry
      const fiveMinutesInMs = 5 * 60 * 1000;
      if (Date.now() < (token.accessTokenExpires as number) - fiveMinutesInMs) {
        return token;
      }

      // Access token has expired, try to update it
      console.log("[NextAuth JWT] Access token expired, attempting refresh...");
      
      try {
        // Use memoized refresh to prevent multiple simultaneous refreshes
        const refreshedToken = await memoizeRequest(
          `refresh-${token.refreshToken}`,
          () => refreshAccessToken(token.refreshToken as string)
        );
        
        if (refreshedToken.error) {
          console.error("[NextAuth JWT] Refresh failed:", refreshedToken.error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
        
        console.log("[NextAuth JWT] Token refreshed successfully");
        return {
          ...token,
          accessToken: refreshedToken.accessToken,
          refreshToken: refreshedToken.refreshToken,
          accessTokenExpires: refreshedToken.accessTokenExpires,
          error: undefined, // Clear any previous errors
        };
      } catch (error) {
        console.error("[NextAuth JWT] Token refresh error:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        // Force sign out if refresh failed
        session.error = "RefreshAccessTokenError";
        return session;
      }

      session.user = {
        id: token.id as string,
        username: token.username as string,
        email: token.email as string | null,
        profile_image: token.profile_image as string | null,
        positions: token.positions as string,
        properties: token.properties as Property[],
        created_at: token.created_at as string,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        accessTokenExpires: token.accessTokenExpires as number,
      };
      
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`[NextAuth] User ${user.id} signed in successfully`);
    },
    async signOut({ session, token }) {
      console.log(`[NextAuth] User signed out`);
      // Clear any cached data
      if (token?.id) {
        // You can add cache clearing logic here if needed
      }
    },
    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        console.error(`[NextAuth] Session error: Failed to refresh access token`);
      }
    },
  },

  pages: { 
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
