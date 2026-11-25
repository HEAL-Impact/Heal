'use client';

import { useLang } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  ArrowLeft,
  Calendar,
  TrendingUp,
  BarChart3,
  Plus,
  Smile,
  Meh,
  Frown,
  Star,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Moon,
  Loader2,
  Save,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';

interface MoodEntry {
  id: string;
  userId: string;
  moodScore: number;
  notes: string;
  createdAt: string;
}

interface MoodStats {
  averageMood: number;
  totalEntries: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
  weeklyAverage: number;
  monthlyAverage: number;
}

const moodEmojis = {
  1: { emoji: '😢', label: { en: 'Very Sad', sw: 'Huzuni sana' }, color: 'text-red-500', bg: 'bg-red-50' },
  2: { emoji: '😔', label: { en: 'Sad', sw: 'Huzuni' }, color: 'text-red-400', bg: 'bg-red-50' },
  3: { emoji: '😐', label: { en: 'Poor', sw: 'Si vizuri' }, color: 'text-orange-400', bg: 'bg-orange-50' },
  4: { emoji: '😕', label: { en: 'Low', sw: 'Chini' }, color: 'text-orange-300', bg: 'bg-orange-50' },
  5: { emoji: '😐', label: { en: 'Neutral', sw: 'Kawaida' }, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  6: { emoji: '🙂', label: { en: 'Okay', sw: 'Sawa' }, color: 'text-yellow-400', bg: 'bg-yellow-50' },
  7: { emoji: '😊', label: { en: 'Good', sw: 'Vizuri' }, color: 'text-[#2C4A4E]', bg: 'bg-[#2C4A4E]/10' },
  8: { emoji: '😄', label: { en: 'Great', sw: 'Vizuri sana' }, color: 'text-[#2C4A4E]', bg: 'bg-[#2C4A4E]/10' },
  9: { emoji: '😁', label: { en: 'Excellent', sw: 'Bora' }, color: 'text-[#2C4A4E]', bg: 'bg-[#2C4A4E]/10' },
  10: { emoji: '🤩', label: { en: 'Amazing', sw: 'Ajabu' }, color: 'text-[#2C4A4E]', bg: 'bg-[#2C4A4E]/10' }
};

const moodIcons = {
  1: CloudRain,
  2: CloudRain,
  3: Cloud,
  4: Cloud,
  5: Sun,
  6: Sun,
  7: Sun,
  8: Star,
  9: Star,
  10: Zap
};

export default function MoodTrackerPage() {
  const { tr } = useLang();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'log' | 'history' | 'analytics'>('log');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !user) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Load mood data
  useEffect(() => {
    if (isAuthenticated) {
      loadMoodData();
    }
  }, [isAuthenticated, timeFilter]);

  const loadMoodData = async () => {
    try {
      setIsLoading(true);
      
      // Load mood history
      const days = timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 365;
      const historyResponse = await apiClient.getMoodHistory(days);
      
      if (historyResponse.data?.logs) {
        setMoodEntries(historyResponse.data.logs);
        calculateStats(historyResponse.data.logs);
      }
    } catch (error) {
      console.error('Failed to load mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (entries: MoodEntry[]) => {
    if (entries.length === 0) {
      setMoodStats({
        averageMood: 0,
        totalEntries: 0,
        streak: 0,
        trend: 'stable',
        weeklyAverage: 0,
        monthlyAverage: 0
      });
      return;
    }

    const totalMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0);
    const averageMood = totalMood / entries.length;

    // Calculate weekly average (last 7 entries)
    const weeklyEntries = entries.slice(0, 7);
    const weeklyAverage = weeklyEntries.length > 0 
      ? weeklyEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / weeklyEntries.length 
      : 0;

    // Calculate monthly average (last 30 entries)
    const monthlyEntries = entries.slice(0, 30);
    const monthlyAverage = monthlyEntries.length > 0
      ? monthlyEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / monthlyEntries.length
      : 0;

    // Calculate trend (compare last week to previous week)
    const lastWeek = entries.slice(0, 7);
    const previousWeek = entries.slice(7, 14);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (lastWeek.length > 0 && previousWeek.length > 0) {
      const lastWeekAvg = lastWeek.reduce((sum, entry) => sum + entry.moodScore, 0) / lastWeek.length;
      const prevWeekAvg = previousWeek.reduce((sum, entry) => sum + entry.moodScore, 0) / previousWeek.length;
      
      if (lastWeekAvg > prevWeekAvg + 0.5) trend = 'up';
      else if (lastWeekAvg < prevWeekAvg - 0.5) trend = 'down';
    }

    // Calculate streak (consecutive days with entries)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].createdAt);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    setMoodStats({
      averageMood,
      totalEntries: entries.length,
      streak,
      trend,
      weeklyAverage,
      monthlyAverage
    });
  };

  const logMood = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLogging(true);
      
      const response = await apiClient.logMood(selectedMood, notes);
      
      if (response.data) {
        // Add new entry to the beginning of the list
        setMoodEntries(prev => [response.data!, ...prev]);
        
        // Reset form
        setSelectedMood(5);
        setNotes('');
        
        // Recalculate stats
        const updatedEntries = [response.data, ...moodEntries];
        calculateStats(updatedEntries);
        
        // Show success message
        alert(tr("Mood logged successfully!", "Hisia imerekodiwa!"));
      } else {
        alert(tr("Failed to log mood. Please try again.", "Imeshindikana kurekodi hisia. Tafadhali jaribu tena."));
      }
    } catch (error) {
      console.error('Failed to log mood:', error);
      alert(tr("Failed to log mood. Please try again.", "Imeshindikana kurekodi hisia. Tafadhali jaribu tena."));
    } finally {
      setIsLogging(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'text-red-500';
    if (score <= 5) return 'text-yellow-500';
    if (score <= 7) return 'text-[#2C4A4E]';
    return 'text-[#2C4A4E]';
  };

  const getMoodBg = (score: number) => {
    if (score <= 3) return 'bg-red-50';
    if (score <= 5) return 'bg-yellow-50';
    if (score <= 7) return 'bg-[#2C4A4E]/10';
    return 'bg-[#2C4A4E]/10';
  };

  if ((authLoading || isLoading) && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#2C4A4E]" />
          <span className="text-white">{tr("Loading mood tracker...", "Inapakia hisia zangu...")}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-sm border-b border-gray-700">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold text-white font-acme">{tr("Mood Tracker", "Hisia Zangu")}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('log')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'log' ? 'bg-[#2C4A4E] text-white' : 'text-white bg-[#2C4A4E] hover:bg-[#2C4A4E]/90'
                }`}
              >
                {tr("Log Mood", "Rekodi Hisia")}
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'history' ? 'bg-[#2C4A4E] text-white' : 'text-white bg-[#2C4A4E] hover:bg-[#2C4A4E]/90'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'analytics' ? 'bg-[#2C4A4E] text-white' : 'text-white bg-[#2C4A4E] hover:bg-[#2C4A4E]/90'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        {moodStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="heal-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white mb-1">{tr("Current Streak", "Mfululizo wa Sasa")}</p>
                  <p className="text-2xl font-bold text-[#2C4A4E]">{tr(`${moodStats.streak} days`, `siku ${moodStats.streak}`)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--heal-light-blue)'}}>
                  <Calendar className="h-6 w-6 heal-text-accent" />
                </div>
              </div>
            </div>
            
            <div className="heal-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white mb-1">{tr("Average Mood", "Wastani wa Hisia")}</p>
                  <p className={`text-2xl font-bold ${getMoodColor(moodStats.averageMood)}`}>
                    {moodStats.averageMood.toFixed(1)}/10
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getMoodBg(moodStats.averageMood)}`}>
                  <span className="text-2xl">{moodEmojis[Math.round(moodStats.averageMood) as keyof typeof moodEmojis]?.emoji}</span>
                </div>
              </div>
            </div>
            
            <div className="heal-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white mb-1">{tr("Total Entries", "Jumla ya Rekodi")}</p>
                  <p className="text-2xl font-bold text-[#2C4A4E]">{moodStats.totalEntries}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--heal-beige)'}}>
                  <BarChart3 className="h-6 w-6" style={{color: 'var(--heal-light-teal)'}} />
                </div>
              </div>
            </div>
            
            <div className="heal-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white mb-1">{tr("Trend", "Mwelekeo")}</p>
                  <p className={`text-lg font-semibold ${
                    moodStats.trend === 'up' ? 'text-[#2C4A4E]' : 
                    moodStats.trend === 'down' ? 'text-red-600' : 'text-white'
                  }`}>
                    {moodStats.trend === 'up' ? tr('↗ Improving', '↗ Inaimarika') : 
                     moodStats.trend === 'down' ? tr('↘ Declining', '↘ Inashuka') : tr('→ Stable', '→ Thabiti')}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  moodStats.trend === 'up' ? 'bg-[#2C4A4E]/10' : 
                  moodStats.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`h-6 w-6 ${
                    moodStats.trend === 'up' ? 'text-[#2C4A4E]' : 
                    moodStats.trend === 'down' ? 'text-red-600' : 'text-[#2C4A4E]'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {view === 'log' && (
          <div className="max-w-2xl mx-auto">
            <div className="heal-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center font-acme">{tr("How are you feeling today?", "Unajisikiaje leo?")}</h2>
              
              {/* Mood Scale */}
              <div className="mb-8">
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => {
                    const MoodIcon = moodIcons[mood as keyof typeof moodIcons];
                    return (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                          selectedMood === mood
                            ? 'border-[#2C4A4E] bg-white/30 shadow-lg'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{moodEmojis[mood as keyof typeof moodEmojis].emoji}</div>
                          <div className="text-xs font-medium text-white">{mood}</div>
                          <div className="text-xs text-white">{tr(moodEmojis[mood as keyof typeof moodEmojis].label)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-lg font-medium text-gray-200">
                    {tr('Selected:', 'Umechagua:')} <span className={getMoodColor(selectedMood)}>{selectedMood}/10 - {tr(moodEmojis[selectedMood as keyof typeof moodEmojis].label)}</span>
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-200 mb-2">
                  {tr("Notes (optional)", "Maelezo (si lazima)")}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tr("What's contributing to your mood today? Any thoughts or feelings you'd like to record...", "Nini kinachangia hisia zako leo? Mawazo au hisia zozote ungependa kurekodi...")}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C4A4E] focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={logMood}
                disabled={isLogging}
                className="w-full heal-button-primary flex items-center justify-center space-x-2 hover:opacity-80"
              >
                {isLogging ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{tr("Logging...", "Inarekodi...")}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{tr("Log Mood", "Rekodi Hisia")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-acme">{tr("Mood History", "Historia ya Hisia")}</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as 'week' | 'month' | 'all')}
                  className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C4A4E] focus:border-transparent"
                >
                  <option value="week">{tr("Last Week", "Wiki Iliyopita")}</option>
                  <option value="month">{tr("Last Month", "Mwezi Uliopita")}</option>
                  <option value="all">{tr("All Time", "Muda Wote")}</option>
                </select>
              </div>
            </div>

            {moodEntries.length === 0 ? (
              <div className="heal-card p-12 text-center">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 font-acme">{tr("No mood entries yet", "Bado hakuna rekodi za hisia")}</h3>
                <p className="text-white mb-6">{tr("Start tracking your mood to see your history here.", "Anza kufuatilia hisia zako ili kuona historia yako hapa.")}</p>
                <button
                  onClick={() => setView('log')}
                  className="heal-button-primary"
                >
                  {tr("Log Your First Mood", "Rekodi Hisia Yako ya Kwanza")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {moodEntries.map((entry) => (
                  <div key={entry.id} className="heal-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getMoodBg(entry.moodScore)}`}>
                          <span className="text-2xl">{moodEmojis[entry.moodScore as keyof typeof moodEmojis].emoji}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-lg font-semibold ${getMoodColor(entry.moodScore)}`}>
                              {entry.moodScore}/10
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-white">{tr(moodEmojis[entry.moodScore as keyof typeof moodEmojis].label)}</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-200 text-sm leading-relaxed">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'analytics' && moodStats && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 font-acme">{tr("Mood Analytics", "Uchambuzi wa Hisia")}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Detailed Stats */}
              <div className="heal-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-acme">{tr("Detailed Statistics", "Takwimu za Kina")}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">{tr("Weekly Average:", "Wastani wa Wiki:")}</span>
                    <span className={`font-semibold ${getMoodColor(moodStats.weeklyAverage)}`}>
                      {moodStats.weeklyAverage.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">{tr("Monthly Average:", "Wastani wa Mwezi:")}</span>
                    <span className={`font-semibold ${getMoodColor(moodStats.monthlyAverage)}`}>
                      {moodStats.monthlyAverage.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">{tr("Overall Average:", "Wastani wa Jumla:")}</span>
                    <span className={`font-semibold ${getMoodColor(moodStats.averageMood)}`}>
                      {moodStats.averageMood.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">{tr("Current Streak:", "Mfululizo wa Sasa:")}</span>
                    <span className="font-semibold text-[#2C4A4E]">{tr(`${moodStats.streak} days`, `siku ${moodStats.streak}`)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">{tr("Total Entries:", "Jumla ya Rekodi:")}</span>
                    <span className="font-semibold text-white">{moodStats.totalEntries}</span>
                  </div>
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="heal-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-acme">{tr("Mood Distribution", "Mgawanyo wa Hisia")}</h3>
                <div className="space-y-3">
                  {Object.entries(
                    moodEntries.reduce((acc, entry) => {
                      const range = entry.moodScore <= 3 ? 'Low (1-3)' :
                                   entry.moodScore <= 5 ? 'Neutral (4-5)' :
                                   entry.moodScore <= 7 ? 'Good (6-7)' : 'Great (8-10)';
                      acc[range] = (acc[range] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([range, count]) => {
                    const percentage = moodEntries.length > 0 ? (count / moodEntries.length) * 100 : 0;
                    const color = range.includes('Low') ? 'bg-red-500' :
                                 range.includes('Neutral') ? 'bg-yellow-500' :
                                 range.includes('Good') ? 'bg-[#2C4A4E]/20' : 'bg-[#2C4A4E]';
                    
                    return (
                      <div key={range}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{range}</span>
                          <span className="text-white">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="heal-card p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4 font-acme">{tr("Insights & Recommendations", "Maarifa na Mapendekezo")}</h3>
              <div className="space-y-4">
                {moodStats.trend === 'up' && (
                  <div className="p-4 bg-[#2C4A4E]/10 border border-[#2C4A4E]/20 rounded-lg">
                    <p className="text-[#2C4A4E]">
                      {tr("🎉 Great news! Your mood has been trending upward. Keep up the positive momentum!", "🎉 Habari njema! Hisia zako zimekuwa zikiimarika. Endelea hivyo!")}
                    </p>
                  </div>
                )}
                {moodStats.trend === 'down' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      {tr("💛 Your mood has been declining recently. Consider reaching out for support or trying some self-care activities.", "💛 Hisia zako zimekuwa zikishuka hivi karibuni. Fikiria kutafuta msaada au kujaribu shughuli za kujitunza.")}
                    </p>
                  </div>
                )}
                {moodStats.streak >= 7 && (
                  <div className="p-4 bg-[#2C4A4E]/10 border border-[#2C4A4E]/20 rounded-lg">
                    <p className="text-[#2C4A4E]">
                      🔥 Amazing! You've been consistently tracking your mood for {moodStats.streak} days. This self-awareness is a powerful tool for mental health.
                    </p>
                  </div>
                )}
                {moodStats.averageMood >= 7 && (
                  <div className="p-4 bg-[#2C4A4E]/10 border border-[#2C4A4E]/20 rounded-lg">
                    <p className="text-[#2C4A4E]">
                      {tr("✨ Your overall mood average is excellent! You're doing great at maintaining positive mental health.", "✨ Wastani wa hisia zako ni bora sana! Unafanya vizuri kutunza afya chanya ya akili.")}
                    </p>
                  </div>
                )}
                {moodStats.averageMood < 5 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">
                      {tr("🤗 Your mood has been lower than average. Remember that it's okay to have difficult times. Consider talking to a mental health professional.", "🤗 Hisia zako zimekuwa chini ya wastani. Kumbuka ni sawa kupitia nyakati ngumu. Fikiria kuongea na mtaalamu wa afya ya akili.")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}