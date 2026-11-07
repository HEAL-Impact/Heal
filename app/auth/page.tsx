'use client';

import { useLang } from '@/lib/i18n';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AuthRedirect() {
  const { tr } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to the appropriate new route based on mode parameter
  useEffect(() => {
    // Keep next/email so the person lands back where they started.
    const rest = new URLSearchParams(searchParams.toString());
    const mode = rest.get('mode');
    rest.delete('mode');
    const query = rest.toString() ? `?${rest.toString()}` : '';
    router.replace(`${mode === 'signup' ? '/auth/signup' : '/auth/signin'}${query}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#ECE5DA] flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#2C4A4E]" />
        <span className="text-gray-600">{tr("Redirecting...", "Inaelekeza...")}</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { tr } = useLang();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ECE5DA] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#2C4A4E]" />
          <span className="text-gray-600">{tr("Loading...", "Inapakia...")}</span>
        </div>
      </div>
    }>
      <AuthRedirect />
    </Suspense>
  );
}