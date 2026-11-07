'use client';

import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface MoodEntry {
  id: string;
  moodScore: number;
  createdAt: string;
}

const moodEmojis = {
  1: '😢', 2: '😔', 3: '😐', 4: '😕', 5: '😐',
  6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩'
};

export function MoodWidget() {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [averageMood, setAverageMood] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentMoods();
  }, []);

  const loadRecentMoods = async () => {
    try {
      const response = await apiClient.getMoodHistory(7); // Last 7 days
      if (response.data?.logs) {
        const moods = response.data.logs.slice(0, 7);
        setRecentMoods(moods);
        
        if (moods.length > 0) {
          const avg = moods.reduce((sum, mood) => sum + mood.moodScore, 0) / moods.length;
          setAverageMood(avg);
        }
      }
    } catch (error) {
      console.error('Failed to load recent moods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'text-red-500';
    if (score <= 5) return 'text-yellow-500';
    if (score <= 7) return 'text-[#2C4A4E]';
    return 'text-[#2C4A4E]';
  };

  if (isLoading) {
    return (
      <div className="heal-card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex space-x-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="heal-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="font-semibold text-gray-900">Mood Tracker</h3>
        </div>
        <Link href="/mood" className="text-[#2C4A4E] hover:text-[#2C4A4E] text-sm font-medium">
          View All
        </Link>
      </div>

      {recentMoods.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">😊</div>
          <p className="text-gray-600 text-sm mb-4">Start tracking your daily mood</p>
          <Link href="/mood" className="inline-flex items-center space-x-2 text-[#2C4A4E] hover:text-[#2C4A4E] text-sm font-medium">
            <Plus className="h-4 w-4" />
            <span>Log Mood</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">7-Day Average</p>
              <p className={`text-xl font-bold ${getMoodColor(averageMood)}`}>
                {averageMood.toFixed(1)}/10
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-[#2C4A4E]" />
              <span className="text-sm text-[#2C4A4E]">Tracking</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500">Recent moods</span>
            <span className="text-xs text-gray-500">Today</span>
          </div>

          <div className="flex space-x-2 mb-4">
            {recentMoods.slice(0, 7).reverse().map((mood, index) => (
              <div
                key={mood.id}
                className="flex-1 text-center"
                title={`${mood.moodScore}/10 - ${new Date(mood.createdAt).toLocaleDateString()}`}
              >
                <div className="text-lg mb-1">
                  {moodEmojis[mood.moodScore as keyof typeof moodEmojis]}
                </div>
                <div className={`text-xs font-medium ${getMoodColor(mood.moodScore)}`}>
                  {mood.moodScore}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/mood"
            className="w-full bg-[#2C4A4E]/10 hover:bg-[#2C4A4E]/10 text-[#2C4A4E] font-medium py-2 px-4 rounded-lg transition-colors text-center block text-sm"
          >
            Log Today's Mood
          </Link>
        </>
      )}
    </div>
  );
}