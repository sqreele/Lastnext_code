// app/components/SessionHandler.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError" && !isSigningOut) {
      console.log("[SessionHandler] Refresh token error detected, signing out");
      setIsSigningOut(true);
      
      signOut({ 
        callbackUrl: '/auth/signin?error=session_expired',
        redirect: true 
      }).catch((error) => {
        console.error("[SessionHandler] Sign out error:", error);
        // Force redirect if signOut fails
        window.location.href = '/auth/signin?error=session_expired';
      });
    }
  }, [session?.error, isSigningOut]);

  // Show loading state while signing out
  if (isSigningOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Session expired. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
