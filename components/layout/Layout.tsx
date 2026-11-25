
import React from 'react';
import Sidebar from '../Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  onToggle: (collapsed: boolean) => void;
  sidebarCollapsed: boolean;
  user: User;
}

function Layout({ children, onToggle, sidebarCollapsed, user }: LayoutProps) {

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);


  if (authLoading) {
    return (
      <div className="h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex"
      style={{ backgroundImage: "linear-gradient(rgba(236, 229, 218, 0.3), rgba(236, 229, 218, 0.3)), url('/images/forestbg.jpg')" }}> 
    </div>
    )
  }
  return (
    <div className="h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex"
      style={{ backgroundImage: "linear-gradient(rgba(236, 229, 218, 0.3), rgba(236, 229, 218, 0.3)), url('/images/forestbg.jpg')" }}>

      <Sidebar onToggle={onToggle} user={user?.firstName || ''} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-0' : 'ml-0'} relative`}>

        {/* Background overlay for readability */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>

        {/* Scrollable Content Container */}
        <div className="relative z-10 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout;
