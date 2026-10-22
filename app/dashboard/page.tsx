'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  BookOpen,
  Phone,
  BarChart3,
  TrendingUp,
  Calendar,
  Star,
  AlertTriangle,
  Loader2,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { MoodWidget } from '@/components/MoodWidget';
import { LatestScreeningCard } from '@/components/screening/LatestScreeningCard';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !user) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Load user stats
  useEffect(() => {
    const loadStats = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await apiClient.getUserStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated]);

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Talk to your AI companion',
      icon: MessageCircle,
      href: 'dashboard/chat',
      color: 'bg-blue-500',
      urgent: false
    },
    {
      title: 'Track Mood',
      description: 'Log your daily mood',
      icon: BarChart3,
      href: 'dashboard/mood',
      color: 'bg-purple-500',
      urgent: false
    },
    {
      title: 'Resource Library',
      description: 'Browse self-help resources',
      icon: BookOpen,
      href: 'dashboard/resources',
      color: 'bg-green-500',
      urgent: false
    },
    {
      title: 'Crisis Support',
      description: 'Get immediate help',
      icon: Phone,
      href: 'dashboard/crisis',
      color: 'bg-red-500',
      urgent: true
    }
  ];

  if ((authLoading || isLoading) && !user) {
    return (
      <div className="h-screen bg-gray-50 bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: "url('/images/forestbg.jpg')" }}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin heal-text-primary" />
          <span className="heal-text-secondary text-sm sm:text-base">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg font-acme">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-white/90 text-sm sm:text-base drop-shadow">
            {stats ? (
              `You're on a ${stats.currentStreak || 0}-day streak. Keep up the great work on your mental health journey.`
            ) : (
              'Loading your progress...'
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80 mb-1">Current Streak</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-300">{stats?.currentStreak || 0} days</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Sessions</p>
                <p className="text-lg sm:text-2xl font-bold text-green-300">{stats?.totalSessions || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80 mb-1">Mood Score</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-300">{stats?.moodScore?.toFixed(1) || '0.0'}/10</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 sm:h-6 sm:w-6 text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/80 mb-1">Days Active</p>
                <p className="text-base sm:text-lg font-semibold text-white">{stats?.daysActive || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 drop-shadow font-acme">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 shadow-lg ${action.urgent ? 'ring-2 ring-red-400/50 border-red-300/50' : ''
                    }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.color} rounded-lg flex items-center justify-center shadow-lg ${action.urgent ? 'pulse-glow' : ''
                      }`}>
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 text-sm sm:text-base drop-shadow">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-white/80">{action.description}</p>
                      {action.urgent && (
                        <div className="flex items-center mt-2">
                          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-300 mr-1" />
                          <span className="text-xs text-red-300 font-medium">Available 24/7</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Activity */}
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 drop-shadow font-acme">Recent Activity</h2>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <p className="text-white/80 text-center py-6 sm:py-8 text-sm sm:text-base">
                Your recent activities will appear here once you start using the platform.
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Mood Widget */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <MoodWidget />
            </div>

            {/* Latest Screening */}
            {user && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
                <LatestScreeningCard userId={user.id} />
              </div>
            )}

            {/* Today's Reminder */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base drop-shadow font-acme">Today's Reminder</h3>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-200 mb-2">
                  "Progress, not perfection, is the goal."
                </p>
                <p className="text-xs text-blue-300">
                  Take a moment to appreciate how far you've come.
                </p>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base drop-shadow font-acme">Upcoming</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">Mood Check-in</p>
                    <p className="text-xs text-white/70">Daily reminder at 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Status */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base drop-shadow font-acme">Privacy & Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span className="text-xs sm:text-sm text-white/90">End-to-End Encryption</span>
                  </div>
                  <span className="text-xs text-green-300 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span className="text-xs sm:text-sm text-white/90">Data Anonymization</span>
                  </div>
                  <span className="text-xs text-green-300 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                    <span className="text-xs sm:text-sm text-white/90">HIPAA Compliant</span>
                  </div>
                  <span className="text-xs text-green-300 font-medium">Verified</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="font-semibold text-red-200 mb-2 text-sm sm:text-base drop-shadow font-acme">Emergency Support</h3>
              <p className="text-xs sm:text-sm text-red-300 mb-3 sm:mb-4">
                If you're having thoughts of self-harm or suicide, please reach out immediately.
              </p>
              <div className="space-y-2">
                <Link href="/crisis" className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-lg">
                  Get Crisis Support
                </Link>
                <p className="text-xs text-red-300 text-center">
                  Or call 999 (Suicide & Crisis Lifeline)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}