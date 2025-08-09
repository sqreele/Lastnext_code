// app/lib/api-client.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

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

// Request Interceptor - Only add token, don't handle refresh
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for token refresh endpoint
    if (config.url?.includes('/api/token/refresh/')) {
      return config;
    }

    const session = await getSession();
    const accessToken = session?.user?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401s by signing out
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If we get a 401 and haven't already retried, sign out the user
    // NextAuth will handle the token refresh automatically
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[API Client] Got 401, session may be expired");
      
      // Check if session has refresh error
      const session = await getSession();
      if (session?.error === "RefreshAccessTokenError") {
        console.log("[API Client] Refresh token failed, signing out");
        signOut({ redirect: false });
        return Promise.reject(new ApiError("Session expired", 401));
      }
      
      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // Wait a bit and retry once (NextAuth might have refreshed the token)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get fresh session and retry
      const newSession = await getSession();
      if (newSession?.user?.accessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newSession.user.accessToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(handleApiError(error));
  }
);

// Generic API functions
export async function fetchData<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T | null> {
  try {
    const response = await apiClient.get<T>(endpoint, options);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw handleApiError(error);
  }
}

export async function postData<T, D>(endpoint: string, data: D): Promise<T> {
  try {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    throw handleApiError(error);
  }
}

export async function updateData<T, D>(endpoint: string, data: D): Promise<T> {
  try {
    const response = await apiClient.put<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}:`, error);
    throw handleApiError(error);
  }
}

export async function patchData<T, D>(endpoint: string, data: D): Promise<T> {
  try {
    const response = await apiClient.patch<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error patching data at ${endpoint}:`, error);
    throw handleApiError(error);
  }
}

export async function deleteData(endpoint: string): Promise<void> {
  try {
    await apiClient.delete(endpoint);
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);
    throw handleApiError(error);
  }
}

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
