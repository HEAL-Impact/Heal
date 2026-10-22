
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Home,
  MessageCircle,
  BookOpen,
  Phone,
  BarChart3,
  Settings,
  User,
  Bell,
  Shield,
  LogOut,
  Plus,
  ChevronDown,
  AlertTriangle,
  Trophy,
  Image,
  Menu,
  PanelLeftClose,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import userImage from '@/public/images/heal-logo.png';
import { authManager } from '@/lib/auth';
import { useGuestScreenings } from '@/hooks/use-guest-screenings';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
  user: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  // Guest-mode screenings on this device waiting to be saved to the account.
  const { count: unsavedScreenings } = useGuestScreenings();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', hasSubmenu: true, link: '/dashboard' },
    { icon: Heart, label: 'Mood Tracker', link: '/dashboard/mood' },
    { icon: ClipboardList, label: 'Screenings', link: '/dashboard/screenings', dot: unsavedScreenings > 0 },
    { icon: AlertTriangle, label: 'Crisis', link: '/dashboard/crisis' },
    { icon: BookOpen, label: 'Resources', link: '/dashboard/resources' },
    { icon: Bell, label: 'Notifications', link: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', link: '/dashboard/settings' }
  ];

  const dashboardSubItems = [
    { icon: Shield, label: 'Safe Space', link: '/dashboard/chat' },
    { icon: MessageCircle, label: 'Anonymous', link: '/anonymous', requiresLogout: true },
    { icon: Trophy, label: 'Champions', link: '#' }
  ];

  const chatHistory = [
    'GBV Signs...',
    'All Is Said...'
  ];

  // Handle clicks outside sidebar
  useEffect(() => {
    // Disable auto-collapse on chat page to prevent modal interference
    if (pathname === '/dashboard/chat') {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't collapse sidebar if clicking on navigation elements, back buttons, or modals
      if (target.closest('a[href]') || 
          target.closest('button[aria-label*="back"]') || 
          target.closest('[data-navigation]') ||
          target.closest('.fixed.inset-0') || // Modal overlay
          target.closest('[role="dialog"]') || // Dialog elements
          target.closest('.heal-card')) { // Modal content
        return;
      }
      
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setIsCollapsed(true);
        onToggle(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onToggle, pathname]);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle(newCollapsed);
  };

  const isActive = (link: string) => {
    if (link === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(link);
  };

  const handleItemClick = (link: string) => {
    if (link) router.push(link);
  };

  const handleAnonymousClick = async () => {
    // Logout user and redirect to anonymous page
    await authManager.logout();
    router.push('/anonymous');
  };

  const handleSubItemClick = (subItem: any) => {
    if (subItem.requiresLogout) {
      handleAnonymousClick();
    } else {
      handleItemClick(subItem.link || '');
    }
  };

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  const handleDashboardClick = () => {
    handleItemClick('/dashboard');
  };

  return (
    <div className="flex relative z-20">
      {/* Toggle Button for collapsed state */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg shadow-lg transition-colors"
        >
          <Menu size={20} className="text-white" />
          {unsavedScreenings > 0 && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white/80" aria-label="Screenings waiting to be saved" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${isCollapsed ? 'w-0' : 'w-64'
          } h-screen relative flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-hidden`}
      >
              <NextImage src="/images/decoration.png" alt="Decoration" 
                      className="absolute z-20 top-1/5 left-1/3 w-auto h-auto opacity-70 -rotate-12"
                      width={40}
                      height={40}
                      priority />
              <NextImage src="/images/decoration.png" alt="Decoration" 
                      className="absolute z-20 top-1/3 right-1/5 w-auto h-auto opacity-60 rotate-25"
                      width={70}
                      height={70}
                      priority />
              <NextImage src="/images/decoration.png" alt="Decoration" 
                      className="absolute z-20 bottom-1/3 left-1/2 w-auto h-auto opacity-50 -rotate-15"
                      width={90}
                      height={90}
                      priority />
              <NextImage src="/images/decoration.png" alt="Decoration" 
                      className="absolute z-20 bottom-1/4 right-1/3 w-auto h-auto opacity-70 rotate-15"
                      width={60}
                      height={60}
                      priority />
        {/* Main sidebar content with gradient background */}
        <div className="absolute w-[13rem] h-full inset-0 bg-[#FEF0D3]"></div>

        {/* All-around fade overlay with rounded effect */}
        <div className="absolute inset-0">
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-r from-[#FEF0D3] pointer-events-none"></div>
        </div>

        {/* Sidebar content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with toggle button */}
          <div className="flex items-center justify-between p-4">
            <div className={`flex items-center space-x-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">{user.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium font-acme">WELCOME TO HEAL</p>
                <p className="text-sm font-semibold text-gray-800 font-acme">{user}</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-orange-100/50 rounded transition-colors"
            >
              <PanelLeftClose size={18} className="text-gray-600" />
            </button>
          </div>
            <div>
              <Link
            href="/"
            className="flex items-center font-acme justify-left px-3 py-2 rounded-lg cursor-pointer transition-colors text-gray-700 hover:bg-orange-50/40 mt-2 mb-4"
            // onClick={() => setIsMobileMenuOpen(false)}
          >
            <ArrowLeft className="w-5 h-5 mr-3" /> <span className='text-sm font-medium'>Back Home</span>
          </Link>
            </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 py-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <ul className="space-y-1 px-3">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <div 
                  className={`flex items-center font-acme justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${pathname === item.link ? 'bg-gradient-to-r from-[#e2c68e] text-orange-800 shadow-sm' : 'text-gray-700 hover:bg-orange-50/40'}`}
                  >
                    <div 
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => handleItemClick(item.link || '')}
                    >
                      <span className="relative">
                        <item.icon size={18} />
                        {item.dot && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.dot && <span className="sr-only">(screenings waiting to be saved)</span>}
                    </div>
                    {item.hasSubmenu && (
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-500 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`}
                        onClick={toggleSubmenu}
                      />
                    )}
                  </div>

                  {/* Dashboard Submenu */}
                  {isSubmenuOpen && item.hasSubmenu && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {dashboardSubItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <div
                            className={`flex items-center font-acme space-x-3 px-3 py-2 text-sm cursor-pointer transition-colors rounded-md hover:bg-orange-50/30 ${
                              pathname === subItem.link ? 'text-orange-600 bg-orange-50/30' : 'text-gray-600 hover:text-orange-600'
                            }`}
                            onClick={() => handleSubItemClick(subItem)}
                          >
                            <subItem.icon size={16} />
                            <span>{subItem.label}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* Chat History Section */}
            <div className="mt-8 px-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold font-acme text-gray-700 uppercase tracking-wide">Chat History</h3>
                <Plus size={16} className="text-gray-500 cursor-pointer hover:text-orange-600 transition-colors" />
              </div>

              <ul className="space-y-2">
                {chatHistory.map((chat, index) => (
                  <li key={index} className="px-3 py-2 font-acme text-sm text-gray-600 hover:bg-orange-50/40 rounded-lg cursor-pointer transition-colors">
                    {chat}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Media Section */}
          <div className={`px-3 py-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div 
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-orange-50/40 rounded-lg cursor-pointer transition-colors"
              onClick={() => handleItemClick('/dashboard/media')}
            >
              <Image size={18} />
              <span className="text-sm font-acme font-medium">Media</span>
            </div>
          </div>

          {/* Logout Section */}
          <div className={`p-3 pr-7 flex h-20 justify-between items-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div onClick={() => { authManager.logout(); router.push('/'); }} className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50/40 hover:text-red-600 rounded-lg cursor-pointer transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium font-acme">Logout</span>
            </div>
            <div>
              <NextImage src={userImage} alt="User" width={40} height={40} className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
