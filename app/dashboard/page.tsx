'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MySpace from '@/components/myspace/MySpace';
import { LatestScreeningCard } from '@/components/screening/LatestScreeningCard';

// Signed-in home is "My Space": one check-in, one next step, reports, safety
// plan and privacy. No streaks, scores or full names on screen, since a phone
// may be shared.
export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) router.push('/auth/signin');
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#ECE5DA]">
        <Loader2 className="h-6 w-6 animate-spin text-[#2C4A4E]" />
      </div>
    );
  }
  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#ECE5DA] pb-20">
      <div className="mx-auto max-w-3xl px-4">
        <MySpace />
        {/* Trauma screenings synced to the account (styled for a dark card). */}
        <div className="rounded-3xl bg-[#2C4A4E] p-6 shadow-sm">
          <LatestScreeningCard userId={user.id} />
        </div>
      </div>
    </div>
  );
}
