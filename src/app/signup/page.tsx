
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page as signup is now handled via Google on the login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Redirecting to login...</p>
    </div>
  );
}
