
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/scbadminpanel');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground animate-pulse">Redirecting to secure panel...</p>
    </div>
  );
}
