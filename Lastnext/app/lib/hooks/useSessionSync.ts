import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';

export function useSessionSync() {
  const { data: session } = useSession();
  const { setUserProperties } = usePropertyStore();

  useEffect(() => {
    if (session?.user?.properties) {
      // Get properties from session and sync with Zustand store
      const properties = session.user.properties;
      console.log(`[SessionSync] Syncing ${properties.length} properties from session`);
      setUserProperties(properties);
    } else {
      console.log('[SessionSync] No properties in session');
      setUserProperties([]);
    }
  }, [session?.user?.properties, setUserProperties]);
} 