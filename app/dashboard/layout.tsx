'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { GuestScreeningsPrompt } from '@/components/screening/GuestScreeningsPrompt';

interface SidebarContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar for video chat pages
  useEffect(() => {
    // Only auto-manage sidebar for chat page, let other pages control their own
    if (pathname === '/dashboard/chat') {
      // Don't auto-collapse, let the page handle it
      return;
    }
  }, [pathname]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <Layout user={user} onToggle={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed}>
        {children}
        {/* The Screenings page shows its own inline version of this prompt. */}
        {pathname !== '/dashboard/screenings' && <GuestScreeningsPrompt userId={user.id} variant="floating" />}
      </Layout>
    </SidebarContext.Provider>
  );
}
