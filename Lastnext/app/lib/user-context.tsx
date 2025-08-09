'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Property } from '@/app/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 500; // 500ms debounce

export interface UserProfile {
  id: number | string;
  username: string;
  profile_image: string | null;
  positions: string;
  properties: Property[];
  email?: string | null;
  created_at: string;
}

export interface UserContextType {
  userProfile: UserProfile | null;
  selectedProperty: string;
  setSelectedProperty: (propertyId: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<UserProfile | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Cache implementation
class UserDataCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const userCache = new UserDataCache();

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedPropertyState] = useState('');
  const fetchPromiseRef = useRef<Promise<UserProfile | null> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to safely extract property ID
  const getPropertyId = useCallback((property: any): string => {
    if (!property) return "";
    if (typeof property === "string" || typeof property === "number") return String(property);
    if (typeof property.property_id === "string" || typeof property.property_id === "number") {
      return String(property.property_id);
    }
    if (typeof property.id === "string" || typeof property.id === "number") {
      return String(property.id);
    }
    return "";
  }, []);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    // Check if we're already fetching
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    if (!session?.user?.accessToken) {
      setUserProfile(null);
      setLoading(false);
      return null;
    }

    const cacheKey = `user-profile-${session.user.id}`;
    
    // Check cache first
    const cachedProfile = userCache.get(cacheKey);
    if (cachedProfile) {
      console.log('Using cached user profile');
      setUserProfile(cachedProfile);
      setLoading(false);
      return cachedProfile;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Create fetch promise
    const fetchPromise = (async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user profile...');
        
        // Parallel fetch of profile and properties
        const [profileResponse, propertiesResponse] = await Promise.all([
          fetch(`${API_URL}/api/user-profiles/`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.user.accessToken}`,
            },
            signal,
          }),
          fetch(`${API_URL}/api/properties/`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.user.accessToken}`,
            },
            signal,
          })
        ]);

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
        }

        if (!propertiesResponse.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesResponse.status}`);
        }

        const profileDataArray = await profileResponse.json();
        const propertiesData = await propertiesResponse.json();
        
        // Get the first profile or handle empty array
        const profileData = Array.isArray(profileDataArray) && profileDataArray.length > 0 
          ? profileDataArray[0] 
          : profileDataArray;
          
        if (!profileData) {
          throw new Error('No profile data found');
        }
        
        // Ensure each property has a valid property_id
        const normalizedProperties = propertiesData.map((property: any) => ({
          ...property,
          property_id: property.property_id || String(property.id)
        }));

        // Create user profile with properties
        const profile: UserProfile = {
          id: profileData.id,
          username: profileData.username,
          profile_image: profileData.profile_image,
          positions: profileData.positions,
          email: profileData.email,
          created_at: profileData.created_at,
          properties: normalizedProperties
        };
        
        // Cache the profile
        userCache.set(cacheKey, profile);
        
        setUserProfile(profile);
        setError(null);

        // Set selected property if not already set
        if (normalizedProperties.length > 0 && !selectedProperty) {
          const storedPropertyId = localStorage.getItem('selectedPropertyId');
          const defaultPropertyId = storedPropertyId && normalizedProperties.some((p: any) => 
            getPropertyId(p) === storedPropertyId
          ) 
            ? storedPropertyId 
            : getPropertyId(normalizedProperties[0]);
            
          setSelectedPropertyState(defaultPropertyId);
        }

        return profile;
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return null;
        }
        
        const message = err instanceof Error ? err.message : 'Failed to fetch profile';
        console.error('Error fetching user data:', message);
        setError(message);
        setUserProfile(null);
        return null;
      } finally {
        setLoading(false);
        fetchPromiseRef.current = null;
        abortControllerRef.current = null;
      }
    })();

    fetchPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, [session?.user?.accessToken, session?.user?.id, selectedProperty, getPropertyId]);

  // Set selected property with localStorage persistence
  const setSelectedProperty = useCallback((propertyId: string) => {
    console.log(`Setting selected property to: ${propertyId}`);
    setSelectedPropertyState(propertyId);
    if (propertyId) {
      localStorage.setItem('selectedPropertyId', propertyId);
    } else {
      localStorage.removeItem('selectedPropertyId');
    }
  }, []);

  // Initialize on mount and session change
  useEffect(() => {
    if (status === 'authenticated' && !userProfile && !fetchPromiseRef.current) {
      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      setUserProfile(null);
      setSelectedPropertyState('');
      userCache.clear();
    }
  }, [status, userProfile, fetchUserProfile]);

  // Load selected property from localStorage on mount
  useEffect(() => {
    const storedPropertyId = localStorage.getItem('selectedPropertyId');
    if (storedPropertyId && !selectedProperty) {
      setSelectedPropertyState(storedPropertyId);
    }
  }, [selectedProperty]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        selectedProperty,
        setSelectedProperty,
        loading,
        error,
        refetch: fetchUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
