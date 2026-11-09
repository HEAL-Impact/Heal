'use client';

import { useLang } from '@/lib/i18n';
import { RESOURCES_SW } from '@/lib/resources-sw';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Video,
  FileText,
  Brain,
  TrendingUp,
  Star,
  Clock,
  Download,
  Play,
  Phone,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { elevenLabsService } from '@/lib/ai-services';

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'assessment' | 'contact';
  category: string;
  duration_minutes: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'Easy';
  featured: boolean;
}

// Static resource data - this replaces the API call
const getStaticResourceData = (): Record<string, Resource> => ({
  '1': {
    id: '1',
    title: 'Understanding Anxiety: A Complete Guide',
    description: 'Learn about anxiety symptoms, triggers, and evidence-based coping strategies.',
    content: 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can significantly impact your daily life. This comprehensive guide covers the different types of anxiety disorders, common symptoms like racing thoughts and physical tension, and practical coping strategies including breathing exercises, grounding techniques, and cognitive behavioral therapy approaches. You\'ll learn how to identify your personal anxiety triggers and develop a toolkit of healthy responses.\n\nKey Topics Covered:\n• Understanding anxiety disorders\n• Recognizing symptoms and triggers\n• Breathing and relaxation techniques\n• Cognitive behavioral therapy strategies\n• Building long-term coping skills\n• When to seek professional help',
    type: 'article',
    category: 'anxiety',
    duration_minutes: 15,
    rating: 4.8,
    difficulty: 'beginner',
    featured: true
  },
  '2': {
    id: '2',
    title: 'Guided Meditation for Depression',
    description: 'A 20-minute guided meditation specifically designed for managing depressive symptoms.',
    content: 'This meditation focuses on self-compassion and gentle awareness, helping you navigate difficult emotions with kindness. The session includes breathing exercises, body awareness, and loving-kindness practices specifically tailored for those experiencing depression. Regular practice can help improve mood, reduce negative self-talk, and build emotional resilience.\n\nWhat You\'ll Experience:\n• Gentle breathing exercises\n• Body awareness and relaxation\n• Self-compassion practices\n• Loving-kindness meditation\n• Techniques for managing difficult emotions\n• Building emotional resilience',
    type: 'audio',
    category: 'depression',
    duration_minutes: 20,
    rating: 4.9,
    difficulty: 'beginner',
    featured: true
  },
  '3': {
    id: '3',
    title: 'Cognitive Behavioral Therapy Techniques',
    description: 'Interactive exercises to help identify and change negative thought patterns.',
    content: 'CBT is one of the most effective treatments for depression and anxiety. This resource provides practical exercises for identifying cognitive distortions, challenging negative thoughts, and developing more balanced thinking patterns. Includes thought records, behavioral activation techniques, and homework assignments to practice between sessions.\n\nTechniques Included:\n• Thought record worksheets\n• Cognitive distortion identification\n• Behavioral activation strategies\n• Problem-solving techniques\n• Mood monitoring tools\n• Relapse prevention planning',
    type: 'exercise',
    category: 'depression',
    duration_minutes: 30,
    rating: 4.7,
    difficulty: 'intermediate',
    featured: false
  },
  '4': {
    id: '4',
    title: 'Building Healthy Relationships',
    description: 'Video series on communication skills and boundary setting.',
    content: 'Healthy relationships are fundamental to mental wellbeing. This video series covers effective communication techniques, how to set and maintain healthy boundaries, conflict resolution skills, and building trust. Learn to recognize unhealthy relationship patterns and develop the skills needed for meaningful connections.\n\nVideo Topics:\n• Effective communication strategies\n• Setting healthy boundaries\n• Conflict resolution techniques\n• Building and maintaining trust\n• Recognizing toxic patterns\n• Creating meaningful connections',
    type: 'video',
    category: 'relationships',
    duration_minutes: 25,
    rating: 4.6,
    difficulty: 'beginner',
    featured: true
  },
  '5': {
    id: '5',
    title: 'Stress Assessment Quiz',
    description: 'Evaluate your stress levels and get personalized recommendations.',
    content: 'This comprehensive assessment helps identify your stress patterns, triggers, and current coping mechanisms. Based on your responses, you\'ll receive personalized recommendations for stress management techniques, lifestyle changes, and resources for further support.\n\nAssessment Areas:\n• Stress level evaluation\n• Trigger identification\n• Coping mechanism analysis\n• Lifestyle factor assessment\n• Personalized recommendations\n• Action plan development',
    type: 'assessment',
    category: 'stress',
    duration_minutes: 10,
    rating: 4.5,
    difficulty: 'beginner',
    featured: false
  },
  '6': {
    id: '6',
    title: 'Advanced Mindfulness Practices',
    description: 'Deep dive into mindfulness techniques for experienced practitioners.',
    content: 'These advanced practices build on basic mindfulness skills and include body scanning, walking meditation, mindful eating, and integration of mindfulness into daily activities. Suitable for those who have established a regular meditation practice and want to deepen their understanding.\n\nAdvanced Techniques:\n• Body scanning meditation\n• Walking meditation practices\n• Mindful eating exercises\n• Daily life integration\n• Advanced breathing techniques\n• Insight meditation practices',
    type: 'exercise',
    category: 'self-care',
    duration_minutes: 45,
    rating: 4.8,
    difficulty: 'advanced',
    featured: false
  },
  'kenya-befrienders': {
    id: 'kenya-befrienders',
    title: 'Befrienders Kenya',
    description: 'Provides emotional support to those in distress through confidential listening.',
    content: 'Befrienders Kenya offers 24/7 emotional support through trained volunteers who provide a safe space to talk about your feelings. They offer confidential telephone support for people experiencing emotional distress, depression, or suicidal thoughts. Services are free and available in English and Kiswahili.\n\nServices Include:\n• 24/7 telephone support\n• Confidential listening\n• Emotional support\n• Crisis intervention\n• Referrals to professional services\n\nContact Information:\nCall: +254 722 178 177\nEmail: info@befrienderskenya.org\nWebsite: www.befrienderskenya.org\n\nAvailable in English and Kiswahili. All services are free and confidential.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.8,
    featured: true
  },
  'kenya-eplus': {
    id: 'kenya-eplus',
    title: 'Emergency Plus Medical Services (E-Plus)',
    description: 'Offers ambulance and pre-hospital emergency medical services across Kenya.',
    content: 'E-Plus provides 24/7 emergency medical services including ambulance services, emergency medical care, and crisis intervention. They have trained medical professionals who can respond to mental health emergencies and provide immediate support while connecting you to appropriate mental health services.\n\nServices Include:\n• 24/7 emergency medical response\n• Ambulance services\n• Mental health crisis intervention\n• Pre-hospital emergency care\n• Medical emergency consultation\n• Referrals to mental health facilities\n\nContact Information:\nEmergency Line: +254 700 395 395\nAlternative: +254 733 395 395\nWebsite: www.eplus.co.ke\n\nNationwide coverage with trained medical professionals.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.7,
    featured: true
  },
  'kenya-redcross': {
    id: 'kenya-redcross',
    title: 'Kenya Red Cross Society',
    description: 'Provides humanitarian services, including disaster response and emergency support.',
    content: 'Kenya Red Cross offers psychosocial support services, emergency response, and community-based mental health programs. They provide crisis counseling, trauma support, and can connect you with local mental health resources. Available nationwide with trained counselors.\n\nServices Include:\n• Psychosocial support\n• Crisis counseling\n• Trauma support\n• Community mental health programs\n• Emergency response\n• Referrals to mental health services\n• Support groups\n\nContact Information:\nHotline: +254 703 037 000\nAlternative: +254 20 3950000\nEmail: info@redcross.or.ke\nWebsite: www.redcross.or.ke\n\nNationwide presence with trained counselors and volunteers.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.6,
    featured: true
  },
  'kenya-mental-health': {
    id: 'kenya-mental-health',
    title: 'Kenya Association for Mental Health',
    description: 'Dedicated to promoting mental health awareness and providing support services.',
    content: 'KAMH provides mental health advocacy, counseling services, and community outreach programs. They offer support groups, individual counseling, and crisis intervention services. They also provide training and education on mental health issues.\n\nServices Include:\n• Mental health advocacy\n• Individual counseling\n• Support groups\n• Crisis intervention\n• Community outreach\n• Training and education\n• Mental health awareness programs\n\nContact Information:\nPhone: +254 20 2717077\nMobile: +254 722 364 456\nEmail: info@mentalhealthkenya.org\nWebsite: www.mentalhealthkenya.org\n\nDedicated to improving mental health care access across Kenya.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.5,
    featured: true
  },
  'kenya-police': {
    id: 'kenya-police',
    title: 'Kenya Police Emergency Services',
    description: 'National police emergency services for immediate crisis intervention.',
    content: 'For immediate emergency situations involving threats to personal safety, domestic violence, or when someone is in immediate danger. Police can provide immediate intervention and connect you with appropriate mental health crisis services.\n\nWhen to Call:\n• Immediate threats to safety\n• Domestic violence situations\n• Someone is in immediate danger\n• Emergency mental health crisis\n• Suicidal behavior requiring intervention\n\nContact Information:\nEmergency: 999\nAlternative: 112\nPolice Hotline: +254 20 341 4906\n\nAvailable 24/7 for emergency situations requiring immediate intervention.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.4,
    featured: true
  },
  'kenya-childline': {
    id: 'kenya-childline',
    title: 'Childline Kenya',
    description: '24/7 helpline for children and young people in crisis.',
    content: 'Childline Kenya provides free, confidential support for children and young people (up to 18 years) facing any kind of problem including mental health issues, abuse, family problems, or suicidal thoughts. Trained counselors provide immediate support and referrals.\n\nServices Include:\n• 24/7 helpline for children and youth\n• Crisis counseling\n• Mental health support\n• Abuse reporting and support\n• Family problem mediation\n• Referrals to appropriate services\n• Follow-up support\n\nContact Information:\nToll-Free: 116\nAlternative: +254 20 2671757\nWebsite: www.childlinekenya.co.ke\n\nSpecialized support for children and young people up to 18 years.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.7,
    featured: true
  },
  'kenya-gender-violence': {
    id: 'kenya-gender-violence',
    title: 'Gender Violence Recovery Centre',
    description: 'Specialized support for survivors of gender-based violence.',
    content: 'GVRC provides comprehensive support for survivors of gender-based violence including counseling, legal aid, medical support, and safe shelter. They have trained counselors who understand trauma and can provide specialized mental health support.\n\nServices Include:\n• Crisis counseling and support\n• Legal aid and advocacy\n• Medical support and referrals\n• Safe shelter and accommodation\n• Trauma-informed therapy\n• Support groups\n• Court accompaniment\n\nContact Information:\nHotline: +254 709 660 000\nNairobi: +254 20 2731313\nWebsite: www.gvrc.or.ke\n\nSpecialized trauma-informed care for survivors of gender-based violence.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.6,
    featured: true
  },
  'kenya-samaritans': {
    id: 'kenya-samaritans',
    title: 'Samaritans Kenya',
    description: 'Emotional support and suicide prevention services.',
    content: 'Samaritans Kenya provides confidential emotional support to anyone experiencing feelings of distress or despair, including those having suicidal thoughts. Trained volunteers offer non-judgmental listening and support 24/7.\n\nServices Include:\n• 24/7 emotional support\n• Suicide prevention\n• Crisis intervention\n• Non-judgmental listening\n• Confidential support\n• Referrals to professional help\n• Follow-up support\n\nContact Information:\nNairobi: +254 722 178 177\nMombasa: +254 41 222 5555\nEmail: samaritanskenya@gmail.com\n\nTrained volunteers providing compassionate support 24/7.',
    type: 'contact',
    category: 'Crisis Support',
    difficulty: 'Easy',
    duration_minutes: 5,
    rating: 4.8,
    featured: true
  }
});

export default function ResourceDetailClient() {
  const { tr } = useLang();
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Audio playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const staticData = getStaticResourceData();
      const resourceData = staticData[id as string];
      
      if (!resourceData) {
        setError('Resource not found');
        return;
      }
      
      setResource(resourceData);
    } catch (err: any) {
      console.error('Failed to fetch resource:', err);
      setError(tr("Failed to load resource. Please try again.", "Imeshindikana kupakia rasilimali. Tafadhali jaribu tena."));
    } finally {
      setLoading(false);
    }
  };

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

  const extractPhoneNumber = (content: string): string | null => {
    const phoneMatch = content.match(/(?:Call:|Phone:|Hotline:|Emergency:)\s*([+\d\s-]+)/i) || 
                     content.match(/([+]\d{3}\s?\d{3}\s?\d{3}\s?\d{3})/);
    return phoneMatch ? phoneMatch[1].trim() : null;
  };

  const extractEmail = (content: string): string | null => {
    const emailMatch = content.match(/Email:\s*([^\s\n]+@[^\s\n]+)/i);
    return emailMatch ? emailMatch[1] : null;
  };

  const extractWebsite = (content: string): string | null => {
    const websiteMatch = content.match(/Website:\s*([^\s\n]+)/i);
    return websiteMatch ? websiteMatch[1] : null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const makeCall = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const sendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const openWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const prepareTextForSpeech = (content: string): string => {
    // Clean up the content for better speech synthesis
    return content
      .replace(/\n\n/g, '. ') // Replace double newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/•/g, '') // Remove bullet points
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/([a-z])([A-Z])/g, '$1. $2') // Add periods between sentences
      .trim();
  };

  const playAudioContent = async () => {
    if (!resource) return;

    try {
      setIsGeneratingAudio(true);
      setAudioError(null);

      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlayingAudio(false);
      }

      // Prepare text for speech
      const textToSpeak = prepareTextForSpeech(tr(resource.content, RESOURCES_SW[resource.id]?.content));
      
      // Limit text length for better performance (ElevenLabs has character limits)
      const maxLength = 2500;
      const truncatedText = textToSpeak.length > maxLength 
        ? textToSpeak.substring(0, maxLength) + '...'
        : textToSpeak;

      console.log('Generating speech for:', resource.title);
      
      // Generate audio using ElevenLabs
      const audioBuffer = await elevenLabsService.textToSpeech(truncatedText);
      
      // Create audio blob and URL
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : 0.7;
      
      audio.onplay = () => {
        setIsPlayingAudio(true);
        setIsGeneratingAudio(false);
      };
      
      audio.onpause = () => {
        setIsPlayingAudio(false);
      };
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setAudioError(tr("Failed to play audio", "Imeshindikana kucheza sauti"));
        setIsPlayingAudio(false);
        setIsGeneratingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      setCurrentAudio(audio);
      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(error instanceof Error ? error.message : tr("Failed to generate audio", "Imeshindikana kutengeneza sauti"));
      setIsGeneratingAudio(false);
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const toggleMute = () => {
    if (currentAudio) {
      const newMutedState = !isMuted;
      currentAudio.volume = newMutedState ? 0 : 0.7;
      setIsMuted(newMutedState);
    }
  };

  const handleInteraction = () => {
    if (!resource) return;
    
    if (resource.type === 'contact') {
      const phoneNumber = extractPhoneNumber(resource.content);
      if (phoneNumber) {
        makeCall(phoneNumber);
      } else {
        // If no phone number found, show contact info
        alert(`Contact: ${resource.title}\nDetails: ${resource.content}`);
      }
    } else if (resource.type === 'video') {
      alert(`Playing video: ${resource.title}\nContent: ${resource.content}`);
    } else if (resource.type === 'audio') {
      // For audio resources, play the content using ElevenLabs
      playAudioContent();
    } else {
      alert(`Starting ${resource.type}: ${resource.title}\nContent: ${resource.content}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen heal-bg-primary">
        <div className="heal-card shadow-sm border-b" style={{borderColor: 'var(--heal-beige)'}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/resources" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 heal-text-secondary" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 heal-text-accent" />
                <h1 className="text-xl font-bold heal-text-primary font-acme">{tr("Loading...", "Inapakia...")}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin heal-text-accent" />
              <span className="heal-text-secondary">{tr("Loading resource...", "Inapakia rasilimali...")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen heal-bg-primary">
        <div className="heal-card shadow-sm border-b" style={{borderColor: 'var(--heal-beige)'}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/resources" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 heal-text-secondary" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 heal-text-accent" />
                <h1 className="text-xl font-bold heal-text-primary font-acme">{tr("Resource Not Found", "Rasilimali Haikupatikana")}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="heal-card p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold heal-text-primary mb-2 font-acme">{error || 'Resource not found'}</h3>
            <p className="heal-text-secondary mb-6">{tr("The resource you're looking for doesn't exist or has been removed.", "Rasilimali unayotafuta haipo au imeondolewa.")}</p>
            <div className="flex justify-center space-x-4">
              <Link href="/resources" className="heal-button-primary hover:underline underline-offset-4">
                {tr("Back to Resources", "Rudi kwenye Rasilimali")}
              </Link>
              <button onClick={fetchResource} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                {tr("Try Again", "Jaribu Tena")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getResourceIcon(resource.type);
  const phoneNumber = extractPhoneNumber(resource.content);
  const email = extractEmail(resource.content);
  const website = extractWebsite(resource.content);

  return (
    <div className="min-h-screen heal-bg-primary">
      {/* Header */}
      <div className="heal-card shadow-sm border-b" style={{borderColor: 'var(--heal-beige)'}}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/resources" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 heal-text-secondary" />
            </Link>
            <div className="flex items-center space-x-2">
              <IconComponent className="h-6 w-6 heal-text-accent" />
              <h1 className="text-xl font-bold heal-text-primary font-acme">{tr(resource.title, RESOURCES_SW[resource.id]?.title)}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="heal-card p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-[#2C4A4E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconComponent className="h-8 w-8 text-[#2C4A4E]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold heal-text-primary mb-2 font-acme">{tr(resource.title, RESOURCES_SW[resource.id]?.title)}</h2>
              <p className="heal-text-secondary mb-4">{tr(resource.description, RESOURCES_SW[resource.id]?.description)}</p>
              
              <div className="flex items-center space-x-6 text-sm heal-text-secondary">
                {resource.duration_minutes > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{resource.duration_minutes} min</span>
                  </div>
                )}
                {resource.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{resource.rating}</span>
                  </div>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#2C4A4E]/10 text-[#2C4A4E]">
                  {resource.type}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          {(isPlayingAudio || isGeneratingAudio || audioError) && (
            <div className="mb-6 bg-[#2C4A4E]/10 border border-[#2C4A4E]/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-[#2C4A4E]" />
                      <span className="text-[#2C4A4E]">{tr("Generating audio...", "Inatengeneza sauti...")}</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <Volume2 className="h-5 w-5 text-[#2C4A4E]" />
                      <span className="text-[#2C4A4E]">{tr("Playing audio narration", "Inacheza usomaji wa sauti")}</span>
                    </>
                  ) : audioError ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800">{audioError}</span>
                    </>
                  ) : null}
                </div>
                
                {isPlayingAudio && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-[#2C4A4E] hover:text-[#2C4A4E] transition-colors"
                      title={isMuted ? tr("Unmute", "Washa sauti") : tr("Mute", "Zima sauti")}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={stopAudio}
                      className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Pause className="h-3 w-3" />
                      <span>{tr("Stop", "Simamisha")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            {resource.type === 'contact' ? (
              <div className="bg-[#2C4A4E]/10 border border-[#2C4A4E]/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold heal-text-primary mb-4 font-acme">{tr("Contact Information", "Mawasiliano")}</h3>
                <div className="whitespace-pre-line heal-text-primary mb-6">
                  {tr(resource.content, RESOURCES_SW[resource.id]?.content)}
                </div>
                
                {/* Contact Actions */}
                <div className="flex flex-wrap gap-3">
                  {phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => makeCall(phoneNumber)}
                        className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call {phoneNumber}</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(phoneNumber)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy phone number"
                      >
                        {copiedText === phoneNumber ? (
                          <CheckCircle className="h-4 w-4 text-[#2C4A4E]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {email && (
                    <button
                      onClick={() => sendEmail(email)}
                      className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{tr("Email", "Barua pepe")}</span>
                    </button>
                  )}

                  {website && (
                    <button
                      onClick={() => openWebsite(website)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{tr("Website", "Tovuti")}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : resource.type === 'video' ? (
              <div className="w-full bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
                <div className="text-center">
                  <Video className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500">{tr("Video Player Placeholder", "Nafasi ya Kicheza Video")}</p>
                  <p className="text-sm text-gray-400 mt-2 max-w-md">{tr(resource.content, RESOURCES_SW[resource.id]?.content)}</p>
                </div>
              </div>
            ) : resource.type === 'audio' ? (
              <div className="w-full bg-gradient-to-r from-[#2C4A4E]/20 to-[#2C4A4E]/20 border border-[#2C4A4E]/20 rounded-lg p-8">
                <div className="text-center">
                  <Headphones className="h-16 w-16 text-[#2C4A4E] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold heal-text-primary mb-2 font-acme">{tr("Audio Content Available", "Maudhui ya Sauti Yanapatikana")}</h3>
                  <p className="heal-text-secondary mb-6">{tr("Listen to this resource with AI-generated narration", "Sikiliza rasilimali hii kwa usomaji wa sauti wa AI")}</p>
                  
                  <button
                    onClick={playAudioContent}
                    disabled={isGeneratingAudio || isPlayingAudio}
                    className="heal-button-primary flex items-center space-x-2 mx-auto mb-4 hover:opacity-80"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{tr("Generating Audio...", "Inatengeneza Sauti...")}</span>
                      </>
                    ) : isPlayingAudio ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>{tr("Playing...", "Inacheza...")}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>{tr("Play Audio", "Cheza Sauti")}</span>
                      </>
                    )}
                  </button>
                  
                  <div className="text-sm heal-text-secondary max-w-md mx-auto">
                    <p className="whitespace-pre-line">{tr(resource.content, RESOURCES_SW[resource.id]?.content)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line heal-text-primary leading-relaxed">
                {tr(resource.content, RESOURCES_SW[resource.id]?.content)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleInteraction} 
              disabled={isGeneratingAudio}
              className="heal-button-primary flex items-center space-x-2 hover:opacity-80"
            >
              <Play className="h-4 w-4" />
              <span>
                {resource.type === 'contact' ? tr("Call / View Contact", "Piga / Ona Mawasiliano") : 
                 resource.type === 'video' ? tr("Play Video", "Cheza Video") :
                 resource.type === 'audio' ? tr("Play Audio", "Cheza Sauti") :
                 tr("Start Resource", "Anza Rasilimali")}
              </span>
            </button>
            
            {/* Play Audio Button for all resource types */}
            {resource.type !== 'audio' && (
              <button
                onClick={playAudioContent}
                disabled={isGeneratingAudio || isPlayingAudio}
                className="bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{tr("Generating...", "Inatengeneza...")}</span>
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>{tr("Playing", "Inacheza")}</span>
                  </>
                ) : (
                  <>
                    <Headphones className="h-4 w-4" />
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

          {/* ElevenLabs Status */}
          <div className="mt-4 text-xs text-gray-500 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'bg-[#2C4A4E]' : 'bg-red-500'}`}></div>
            <span>
              {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY 
                ? tr("AI Voice narration powered by ElevenLabs", "Usomaji wa sauti wa AI unaoendeshwa na ElevenLabs") 
                : tr("ElevenLabs API key required for voice narration", "Ufunguo wa API wa ElevenLabs unahitajika kwa usomaji wa sauti")
              }
            </span>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-8 heal-card p-6">
          <h3 className="text-lg font-semibold heal-text-primary mb-4 font-acme">{tr("Related Resources", "Rasilimali Zinazohusiana")}</h3>
          <p className="heal-text-secondary mb-4">
            Explore more resources in the {resource.category} category to continue your mental health journey.
          </p>
          <Link 
            href={`/resources?category=${encodeURIComponent(resource.category)}`}
            className="heal-button-primary inline-flex items-center space-x-2 hover:underline underline-offset-4"
          >
            <BookOpen className="h-4 w-4" />
            <span>Browse {resource.category} Resources</span>
          </Link>
        </div>
      </div>
    </div>
  );
}