'use client';

import { useLang } from '@/lib/i18n';
import { RESOURCES_SW } from '@/lib/resources-sw';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  Heart,
  Brain,
  Users,
  Star,
  Play,
  Download,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Headphones,
  Video,
  FileText,
  TrendingUp,
  Phone,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { elevenLabsService } from '@/lib/ai-services';

interface Resource {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'assessment' | 'contact';
  category: string;
  duration_minutes: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'Easy';
  featured: boolean;
}

// Static resource data - this replaces the API call for static export
const getStaticResourcesData = (): Resource[] => [
  {
    id: '1',
    title: 'Understanding Anxiety: A Complete Guide',
    description: 'Learn about anxiety symptoms, triggers, and evidence-based coping strategies.',
    content: 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can significantly impact your daily life. This comprehensive guide covers the different types of anxiety disorders, common symptoms like racing thoughts and physical tension, and practical coping strategies including breathing exercises, grounding techniques, and cognitive behavioral therapy approaches.',
    type: 'article',
    category: 'anxiety',
    duration_minutes: 15,
    rating: 4.8,
    difficulty: 'beginner',
    featured: true
  },
  {
    id: '2',
    title: 'Guided Meditation for Depression',
    description: 'A 20-minute guided meditation specifically designed for managing depressive symptoms.',
    content: 'This meditation focuses on self-compassion and gentle awareness, helping you navigate difficult emotions with kindness. The session includes breathing exercises, body awareness, and loving-kindness practices specifically tailored for those experiencing depression.',
    type: 'audio',
    category: 'depression',
    duration_minutes: 20,
    rating: 4.9,
    difficulty: 'beginner',
    featured: true
  },
  {
    id: '3',
    title: 'Cognitive Behavioral Therapy Techniques',
    description: 'Interactive exercises to help identify and change negative thought patterns.',
    content: 'CBT is one of the most effective treatments for depression and anxiety. This resource provides practical exercises for identifying cognitive distortions, challenging negative thoughts, and developing more balanced thinking patterns.',
    type: 'exercise',
    category: 'depression',
    duration_minutes: 30,
    rating: 4.7,
    difficulty: 'intermediate',
    featured: false
  },
  {
    id: '4',
    title: 'Building Healthy Relationships',
    description: 'Video series on communication skills and boundary setting.',
    content: 'Healthy relationships are fundamental to mental wellbeing. This video series covers effective communication techniques, how to set and maintain healthy boundaries, conflict resolution skills, and building trust.',
    type: 'video',
    category: 'relationships',
    duration_minutes: 25,
    rating: 4.6,
    difficulty: 'beginner',
    featured: true
  },
  {
    id: '5',
    title: 'Stress Assessment Quiz',
    description: 'Evaluate your stress levels and get personalized recommendations.',
    content: 'This comprehensive assessment helps identify your stress patterns, triggers, and current coping mechanisms. Based on your responses, you will receive personalized recommendations for stress management techniques.',
    type: 'assessment',
    category: 'stress',
    duration_minutes: 10,
    rating: 4.5,
    difficulty: 'beginner',
    featured: false
  },
  {
    id: '6',
    title: 'Advanced Mindfulness Practices',
    description: 'Deep dive into mindfulness techniques for experienced practitioners.',
    content: 'These advanced practices build on basic mindfulness skills and include body scanning, walking meditation, mindful eating, and integration of mindfulness into daily activities.',
    type: 'exercise',
    category: 'self-care',
    duration_minutes: 45,
    rating: 4.8,
    difficulty: 'advanced',
    featured: false
  },
  {
    id: 'kenya-befrienders',
    title: 'Befrienders Kenya',
    description: 'Provides emotional support to those in distress through confidential listening.',
    content: 'Befrienders Kenya offers 24/7 emotional support through trained volunteers who provide a safe space to talk about your feelings. Call +254 722 178 177 for free confidential support.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.8,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-eplus',
    title: 'Emergency Plus Medical Services (E-Plus)',
    description: 'Offers ambulance and pre-hospital emergency medical services across Kenya.',
    content: 'E-Plus provides 24/7 emergency medical services including crisis intervention. Emergency Line: +254 700 395 395 for immediate medical and mental health emergency response.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.7,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-redcross',
    title: 'Kenya Red Cross Society',
    description: 'Provides humanitarian services, including disaster response and emergency support.',
    content: 'Kenya Red Cross offers psychosocial support services and crisis counseling. Hotline: +254 703 037 000 for nationwide mental health support and emergency response.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.6,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-mental-health',
    title: 'Kenya Association for Mental Health',
    description: 'Dedicated to promoting mental health awareness and providing support services.',
    content: 'KAMH provides mental health advocacy and counseling services. Phone: +254 20 2717077 for individual counseling and crisis intervention services.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.5,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-police',
    title: 'Kenya Police Emergency Services',
    description: 'National police emergency services for immediate crisis intervention.',
    content: 'For immediate emergency situations involving threats to personal safety. Emergency: 999 for immediate intervention and mental health crisis response.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.4,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-childline',
    title: 'Childline Kenya',
    description: '24/7 helpline for children and young people in crisis.',
    content: 'Childline Kenya provides free confidential support for children and young people up to 18 years. Toll-Free: 116 for crisis counseling and mental health support.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.7,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-gender-violence',
    title: 'Gender Violence Recovery Centre',
    description: 'Specialized support for survivors of gender-based violence.',
    content: 'GVRC provides comprehensive support for survivors including counseling and legal aid. Hotline: +254 709 660 000 for specialized trauma-informed mental health support.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.6,
    difficulty: 'Easy',
    featured: true
  },
  {
    id: 'kenya-samaritans',
    title: 'Samaritans Kenya',
    description: 'Emotional support and suicide prevention services.',
    content: 'Samaritans Kenya provides confidential emotional support to anyone experiencing distress. Nairobi: +254 722 178 177 for 24/7 non-judgmental listening and support.',
    type: 'contact',
    category: 'Crisis Support',
    duration_minutes: 5,
    rating: 4.8,
    difficulty: 'Easy',
    featured: true
  }
];

export default function ResourcesPage() {
  const { tr } = useLang();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouter();

  const categories = [
    { id: 'all', name: tr("All Resources", "Rasilimali Zote"), icon: BookOpen },
    { id: 'anxiety', name: tr("Anxiety", "Wasiwasi"), icon: Brain },
    { id: 'depression', name: tr("Depression", "Msongo wa Mawazo"), icon: Heart },
    { id: 'stress', name: tr("Stress Management", "Kudhibiti Msongo"), icon: TrendingUp },
    { id: 'relationships', name: tr("Relationships", "Mahusiano"), icon: Users },
    { id: 'self-care', name: tr("Self-Care", "Kujitunza"), icon: Star },
    { id: 'Crisis Support', name: tr("Crisis Support", "Msaada wa Dharura"), icon: Phone }
  ];

  const typeOptions = [
    { value: 'all', label: tr("All Types", "Aina Zote") },
    { value: 'article', label: tr("Articles", "Makala") },
    { value: 'video', label: tr("Videos", "Video") },
    { value: 'audio', label: tr("Audio", "Sauti") },
    { value: 'exercise', label: tr("Exercises", "Mazoezi") },
    { value: 'assessment', label: tr("Assessments", "Tathmini") },
    { value: 'contact', label: tr("Contacts", "Mawasiliano") }
  ];

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let allResources = getStaticResourcesData();
      
      // Apply filters
      if (selectedCategory !== 'all') {
        allResources = allResources.filter(r => 
          r.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      
      if (selectedType !== 'all') {
        allResources = allResources.filter(r => 
          r.type.toLowerCase() === selectedType.toLowerCase()
        );
      }
      
      setResources(allResources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setError(tr("Failed to load resources. Please try again.", "Imeshindikana kupakia rasilimali. Tafadhali jaribu tena."));
      setResources(getStaticResourcesData());
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'exercise': return Brain;
      case 'assessment': return TrendingUp;
      case 'contact': return Phone;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy': 
        return 'text-[#2C4A4E] bg-[#2C4A4E]/10';
      case 'intermediate': 
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced': 
        return 'text-red-600 bg-red-100';
      default: 
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-[#2C4A4E]/10 text-[#2C4A4E]';
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'audio': return 'bg-[#2C4A4E]/10 text-[#2C4A4E]';
      case 'exercise': return 'bg-orange-100 text-orange-700';
      case 'assessment': return 'bg-pink-100 text-pink-700';
      case 'contact': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const prepareTextForSpeech = (content: string): string => {
    return content
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const playResourceAudio = async (resource: Resource) => {
    if (!resource.content) return;

    try {
      setGeneratingAudio(resource.id);
      
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingAudio(null);
      }

      const textToSpeak = prepareTextForSpeech(tr(resource.content, RESOURCES_SW[resource.id]?.content));
      const maxLength = 1000; // Shorter for preview
      const truncatedText = textToSpeak.length > maxLength 
        ? textToSpeak.substring(0, maxLength) + '...'
        : textToSpeak;

      console.log('Generating speech for:', resource.title);
      
      const audioBuffer = await elevenLabsService.textToSpeech(truncatedText);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      
      audio.onplay = () => {
        setPlayingAudio(resource.id);
        setGeneratingAudio(null);
      };
      
      audio.onpause = () => {
        setPlayingAudio(null);
      };
      
      audio.onended = () => {
        setPlayingAudio(null);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setPlayingAudio(null);
        setGeneratingAudio(null);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      setCurrentAudio(audio);
      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setGeneratingAudio(null);
      setPlayingAudio(null);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingAudio(null);
    }
  };

  const handleResourceClick = (resourceId: string) => {
    router.push(`/resources/${resourceId}`);
  };

  const handleStartResource = (resource: Resource) => {
    if (resource.type === 'contact') {
      router.push('/crisis');
    } else {
      router.push(`/resources/${resource.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="heal-card shadow-sm border-b" style={{borderColor: 'var(--heal-beige)'}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 heal-text-secondary" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 heal-text-accent" />
                <h1 className="text-xl font-bold heal-text-primary font-acme">{tr("Resource Library", "Maktaba ya Rasilimali")}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin heal-text-accent" />
              <span className="heal-text-secondary">{tr("Loading resources...", "Inapakia rasilimali...")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 heal-text-secondary" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 heal-text-accent" />
                <h1 className="text-xl font-bold heal-text-primary font-acme">{tr("Resource Library", "Maktaba ya Rasilimali")}</h1>
              </div>
            </div>
            <div className="text-sm heal-text-secondary">
              {filteredResources.length} resources available
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <p className="text-yellow-800">{error}</p>
              <button 
                onClick={fetchResources}
                className="ml-auto text-yellow-600 hover:text-yellow-700 font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={tr("Search resources...", "Tafuta rasilimali...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="heal-input-light pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="heal-input-light w-full sm:w-auto"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#2C4A4E] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === 'all' && searchTerm === '' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold heal-text-primary mb-6 font-acme">{tr("Featured Resources", "Rasilimali Maalum")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.filter(r => r.featured).slice(0, 6).map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                const isGenerating = generatingAudio === resource.id;
                const isPlaying = playingAudio === resource.id;
                
                return (
                  <div key={resource.id} className="heal-card p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#2C4A4E]/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-[#2C4A4E]" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-700">{resource.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold heal-text-primary mb-2 font-acme">{tr(resource.title, RESOURCES_SW[resource.id]?.title)}</h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-medium">{tr(resource.description, RESOURCES_SW[resource.id]?.description)}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 heal-text-secondary">
                        <Clock className="h-4 w-4 text-gray-700" />
                        <span className="text-gray-700 text-sm line-clamp-2 font-medium">{tr(`${resource.duration_minutes} min`, `dakika ${resource.duration_minutes}`)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                          {resource.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleStartResource(resource)}
                        className="flex-1 heal-button-primary flex items-center justify-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>{resource.type === 'contact' ? tr("View Contact", "Ona Mawasiliano") : tr("Start", "Anza")}</span>
                      </button>
                      
                      {resource.content && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlaying) {
                              stopAudio();
                            } else {
                              playResourceAudio(resource);
                            }
                          }}
                          disabled={isGenerating}
                          className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                          title="Listen to preview"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isPlaying ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <h2 className="text-2xl font-bold heal-text-primary mb-6 font-acme">
            {selectedCategory === 'all' ? tr("All Resources", "Rasilimali Zote") : tr(`${categories.find(c => c.id === selectedCategory)?.name} Resources`, `Rasilimali: ${categories.find(c => c.id === selectedCategory)?.name}`)}
          </h2>
          
          {filteredResources.length === 0 ? (
            <div className="heal-card p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold heal-text-primary mb-2 font-acme">{tr("No resources found", "Hakuna rasilimali zilizopatikana")}</h3>
              <p className="heal-text-secondary">{tr("Try adjusting your search or filter criteria.", "Jaribu kubadilisha utafutaji au vichujio vyako.")}</p>
              {error && (
                <button 
                  onClick={fetchResources}
                  className="mt-4 heal-button-primary hover:opacity-80"
                >
                  {tr("Reload Resources", "Pakia Rasilimali Tena")}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                const isGenerating = generatingAudio === resource.id;
                const isPlaying = playingAudio === resource.id;
                
                return (
                  <div key={resource.id} className="heal-card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-[#2C4A4E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-[#2C4A4E]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold heal-text-primary text-lg font-acme">{tr(resource.title, RESOURCES_SW[resource.id]?.title)}</h3>
                          <div className="flex items-center space-x-2">
                            {resource.featured && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                              {resource.type}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 font-medium">{tr(resource.description, RESOURCES_SW[resource.id]?.description)}</p>
                        
                        <div className="flex items-center space-x-6 text-sm heal-text-secondary mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{tr(`${resource.duration_minutes} min`, `dakika ${resource.duration_minutes}`)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{resource.rating}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleStartResource(resource)}
                              className="heal-button-primary flex items-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>{resource.type === 'contact' ? tr("View Contact", "Ona Mawasiliano") : tr("Start", "Anza")}</span>
                            </button>
                            
                            {resource.content && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPlaying) {
                                    stopAudio();
                                  } else {
                                    playResourceAudio(resource);
                                  }
                                }}
                                disabled={isGenerating}
                                className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{tr("Generating...", "Inatengeneza...")}</span>
                                  </>
                                ) : isPlaying ? (
                                  <>
                                    <VolumeX className="h-4 w-4" />
                                    <span>{tr("Stop", "Simamisha")}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="h-4 w-4" />
                                    <span>{tr("Listen", "Sikiliza")}</span>
                                  </>
                                )}
                              </button>
                            )}
                            
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                              <Download className="h-4 w-4" />
                              <span>{tr("Save", "Hifadhi")}</span>
                            </button>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ElevenLabs Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
            <div className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'bg-[#2C4A4E]' : 'bg-red-500'}`}></div>
            <span>
              {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY 
                ? tr('AI Voice narration powered by ElevenLabs', 'Usomaji wa sauti wa AI unaoendeshwa na ElevenLabs') 
                : tr("ElevenLabs API key required for voice narration", "Ufunguo wa API wa ElevenLabs unahitajika kwa usomaji wa sauti")
              }
            </span>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {!error && filteredResources.length > 0 && (
          <div className="mt-12 heal-card p-6">
            <h3 className="text-lg font-semibold heal-text-primary mb-4 font-acme">{tr("Personalized Recommendations", "Mapendekezo Yako")}</h3>
            <p className="heal-text-secondary mb-4">
              {tr("Based on your recent activities and preferences, we recommend these resources:", "Kulingana na shughuli na mapendeleo yako ya hivi karibuni, tunapendekeza rasilimali hizi:")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-[#2C4A4E]/10 rounded-lg">
                <div className="w-8 h-8 bg-[#2C4A4E]/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-[#2C4A4E]" />
                </div>
                <div>
                  <p className="font-medium heal-text-primary">{tr("Anxiety Management Techniques", "Mbinu za Kudhibiti Wasiwasi")}</p>
                  <p className="text-sm heal-text-secondary">{tr("Based on your mood patterns", "Kulingana na mwenendo wa hisia zako")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-[#2C4A4E]/10 rounded-lg">
                <div className="w-8 h-8 bg-[#2C4A4E]/10 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-[#2C4A4E]" />
                </div>
                <div>
                  <p className="font-medium heal-text-primary">{tr("Self-Compassion Exercises", "Mazoezi ya Kujihurumia")}</p>
                  <p className="text-sm heal-text-secondary">{tr("Popular among similar users", "Maarufu miongoni mwa watumiaji kama wewe")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}