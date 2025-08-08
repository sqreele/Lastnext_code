// app/lib/api-client.ts - Updated token refresh logic

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

interface JwtToken {
  exp?: number;
  user_id?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://pmcs.site"),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const pendingRequests: Array<(token: string | null) => void> = [];

// Process queued requests after token refresh
const processPendingRequests = (token: string | null): void => {
  console.log(`[Auth] Processing ${pendingRequests.length} pending requests`);
  pendingRequests.forEach(callback => callback(token));
  pendingRequests.length = 0;
};

// Enhanced token refresh function with better error handling
async function refreshToken(refreshTokenValue: string): Promise<string | null> {
  try {
    console.log("[Auth] Attempting to refresh access token...");
    
    const response = await fetch(`${apiClient.defaults.baseURL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshTokenValue }),
    });

    if (!response.ok) {
      console.error(`[Auth] Refresh failed with status: ${response.status}`);
      
      // If refresh token is invalid/expired (401/403), sign out user
      if (response.status === 401 || response.status === 403) {
        console.log("[Auth] Refresh token expired/invalid. Signing out user.");
        // Don't await signOut to avoid blocking
        signOut({ redirect: false }).catch(console.error);
      }
      
      throw new ApiError(`Token refresh failed: ${response.status}`, response.status);
    }

    const refreshedTokens = await response.json();
    if (!refreshedTokens.access) {
      throw new Error('Refresh response missing access token');
    }

    console.log("[Auth] Token refreshed successfully");
    return refreshedTokens.access;
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    
    // Sign out user on any refresh failure
    signOut({ redirect: false }).catch(console.error);
    return null;
  }
}

// Request Interceptor - Fixed to prevent infinite loops
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for token refresh endpoint
    if (config.url?.includes('/api/token/refresh/')) {
      return config;
    }

    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    const refreshTokenValue = session?.user?.refreshToken;

    if (!accessToken) {
      console.log("[RequestInterceptor] No access token available");
      return config;
    }

    try {
      const decoded = jwtDecode<JwtToken>(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      const buffer = 60; // 60 second buffer

      // Check if token needs refresh
      if (decoded.exp && decoded.exp < currentTime + buffer) {
        console.log("[RequestInterceptor] Token expired, needs refresh");

        if (!refreshTokenValue) {
          console.log("[RequestInterceptor] No refresh token, signing out");
          signOut({ redirect: false });
          throw new ApiError("Session expired", 401);
        }

        // Handle concurrent refresh attempts
        if (isRefreshing && refreshPromise) {
          console.log("[RequestInterceptor] Refresh in progress, queuing request");
          return new Promise<InternalAxiosRequestConfig>((resolve) => {
            pendingRequests.push((newToken) => {
              if (newToken) {
                config.headers.Authorization = `Bearer ${newToken}`;
              } else {
                delete config.headers.Authorization;
              }
              resolve(config);
            });
          });
        }

        // Start refresh
        isRefreshing = true;
        refreshPromise = refreshToken(refreshTokenValue);

        try {
          const newToken = await refreshPromise;
          
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            delete config.headers.Authorization;
          }
          
          processPendingRequests(newToken);
          return config;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      // Token is valid
      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      console.error("[RequestInterceptor] Error processing token:", error);
      // Use token as-is if decode fails
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Simplified to prevent loops
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Only retry 401s once to prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log("[ResponseInterceptor] Got 401, attempting token refresh");
      
      const session = await getSession();
      if (!session?.user?.refreshToken) {
        console.log("[ResponseInterceptor] No refresh token, signing out");
        signOut({ redirect: false });
        return Promise.reject(new ApiError("Session expired", 401));
      }

      try {
        const newToken = await refreshToken(session.user.refreshToken);
        
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("[ResponseInterceptor] Refresh failed:", refreshError);
      }
      
      // If refresh failed, sign out and reject
      signOut({ redirect: false });
      return Promise.reject(new ApiError("Session expired", 401));
    }

    return Promise.reject(handleApiError(error));
  }
);

// Rest of your existing handleApiError and other functions...
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;
    let message = axiosError.message;

    if (axiosError.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
      return new ApiError(message, 408);
    }

    if (errorData?.detail) {
      message = errorData.detail;
    }

    return new ApiError(message, status, errorData);
  }

  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unknown error occurred');
};

export default apiClient;
