'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import PtsdScreeningFlow from '@/components/screening/PtsdScreeningFlow';
import { startScreeningSync } from '@/lib/screening/sync';

export default function NewScreeningPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    return startScreeningSync(user.id);
  }, [user]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-sm border-b border-gray-700">
        <div className="mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/dashboard/screenings" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-teal-300" />
            <h1 className="text-xl font-bold text-white font-acme">New screening</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {user && <PtsdScreeningFlow userId={user.id} />}
      </div>
    </div>
  );
}
