// app/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { UserProfile, Property } from "@/app/lib/types";
import { getUserProperties } from "./prisma-user-property";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://pmcs.site");

// Dedicated refresh function for NextAuth
async function refreshAccessToken(refreshToken: string) {
  try {
    console.log("[NextAuth] Attempting to refresh access token...");
    
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
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
    console.error('[NextAuth] Token refresh error:', error);
    return {
      error: 'RefreshAccessTokenError',
    };
  }
}

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

        try {
          // Get authentication tokens from API
          const tokenResponse = await fetch(`${API_BASE_URL}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
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

          // Fetch user from database and API
          let user = await prisma.user.findUnique({ where: { id: userId } });
          
          let profileData: Partial<UserProfile> = {};
          try {
            const profileResponse = await fetch(`${API_BASE_URL}/api/user-profiles/${userId}/`, {
              headers: { Authorization: `Bearer ${tokenData.access}`, "Content-Type": "application/json" },
            });
            if (profileResponse.ok) {
              profileData = await profileResponse.json();
            }
          } catch (error) {
            console.error("Failed to fetch profile:", error);
          }

          // Create or update user
          if (!user) {
            user = await prisma.user.upsert({
              where: { id: userId },
              update: {
                username: credentials.username,
                email: profileData.email || null,
                profile_image: profileData.profile_image || null,
                positions: profileData.positions || "User",
                created_at: profileData.created_at ? new Date(profileData.created_at) : new Date(),
              },
              create: {
                id: userId,
                username: credentials.username,
                email: profileData.email || null,
                profile_image: profileData.profile_image || null,
                positions: profileData.positions || "User",
                created_at: profileData.created_at ? new Date(profileData.created_at) : new Date(),
              },
            });
          }

          // Get properties
          let normalizedProperties: Property[] = [];
          if (profileData.properties && profileData.properties.length > 0) {
            normalizedProperties = profileData.properties.map((prop: any) => ({
              id: String(prop.id),
              property_id: String(prop.property_id || prop.id),
              name: prop.name || `Property ${prop.id}`,
              description: prop.description || "",
              created_at: prop.created_at || new Date().toISOString(),
              users: prop.users || [],
            }));
          } else {
            try {
              normalizedProperties = await getUserProperties(userId);
            } catch (error) {
              console.error("Failed to get properties:", error);
              normalizedProperties = [];
            }
          }

          const userProfile: UserProfile = {
            id: userId,
            username: credentials.username,
            email: user.email || profileData.email || null,
            profile_image: user.profile_image || profileData.profile_image || null,
            positions: user.positions || profileData.positions || "User",
            properties: normalizedProperties,
            created_at: user.created_at.toISOString() || profileData.created_at || new Date().toISOString(),
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
        const refreshedToken = await refreshAccessToken(token.refreshToken as string);
        
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
    maxAge: 7 * 24 * 60 * 60, // 7 days (match your refresh token expiry)
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};

export default authOptions;
