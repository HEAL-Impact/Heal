'use client';

import { useLang } from '@/lib/i18n';
import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Send,
  Mic,
  MicOff,
  ArrowLeft,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  MoreVertical,
  Phone,
  Video,
  Bot,
  User,
  Loader2,
  ChevronDown,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { screenAtom } from '@/store/screens';
import { Instructions } from '@/screens/Instructions';
import { Conversation } from '@/screens/Conversation';
import { geminiService, elevenLabsService } from '@/lib/ai-services';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mood?: string;
  type: 'text' | 'audio' | 'video';
  isLoading?: boolean;
  sessionId?: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

type VoiceOption = 'off' | 'female' | 'male';

// Choice Modal Component
const ChoiceModal = ({ onSelect }: { onSelect: (choice: 'chat' | 'video') => void }) => {
  const { tr } = useLang();
  return (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
    <div className="heal-card rounded-2xl p-8 sm:p-10 shadow-xl text-center max-w-sm mx-4 transform transition-all duration-300 ease-out scale-95 animate-in fade-in-0 zoom-in-95">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{tr("How would you like to connect?", "Ungependa kuwasiliana vipi?")}</h2>
      <p className="text-gray-300 mb-8 text-sm sm:text-base">{tr("Choose your preferred method of communication.", "Chagua njia ya mawasiliano unayopendelea.")}</p>
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => onSelect('chat')}
          className="heal-button-primary w-full"
        >
          {tr("Text Chat / Maandishi", "Maandishi / Text Chat")}
        </button>
        <button
          onClick={() => onSelect('video')}
          className="heal-button-secondary w-full"
        >
          {tr("Video Chat / Video", "Video / Video Chat")}
        </button>
      </div>
    </div>
  </div>
  );
};

export default function ChatPage() {
  const { tr } = useLang();
  const { user, isAuthenticated } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceOption, setVoiceOption] = useState<VoiceOption>('female');
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVideoConversation, setShowVideoConversation] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(true);
  const [showVideoTooltip, setShowVideoTooltip] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [, setScreenState] = useAtom(screenAtom);

  // Refs for scrolling and responsive behavior
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<HTMLDivElement>(null);

  // Voice configuration
  const voiceConfigs = {
    off: {
      label: tr("Voice Off", "Sauti Imezimwa"),
      icon: VolumeX,
      color: 'text-gray-600 bg-gray-100',
      voiceId: null
    },
    female: {
      label: tr("Female Voice", "Sauti ya Kike"),
      icon: Volume2,
      color: 'text-pink-600 bg-pink-100',
      voiceId: 'EXAVITQu4vr4xnSDxMaL' // Bella - warm and empathetic female voice
    },
    male: {
      label: tr("Male Voice", "Sauti ya Kiume"),
      icon: Volume2,
      color: 'text-[#2C4A4E] bg-[#2C4A4E]/10',
      voiceId: 'pNInz6obpgDQGcFmaJgB' // Adam - calm and supportive male voice
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Load chat sessions on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    }
  }, [isAuthenticated]);

  // Load chat history when session changes
  useEffect(() => {
    if (currentSessionId && isAuthenticated) {
      loadChatHistory(currentSessionId);
    }
  }, [currentSessionId, isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVoiceDropdown(false);
      }
      if (sessionsRef.current && !sessionsRef.current.contains(event.target as Node)) {
        setShowSessions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const loadChatSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await apiClient.getChatSessions();
      if (response.data?.sessions) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      setLoadingHistory(true);
      const response = await apiClient.getChatHistory(sessionId);
      if (response.data?.messages) {
        const formattedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.senderType,
          timestamp: new Date(msg.createdAt),
          type: msg.messageType || 'text',
          sessionId: msg.sessionId
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowSessions(false);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowSessions(false);
  };

  const deleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm(tr("Are you sure you want to delete this chat session?", "Una uhakika unataka kufuta mazungumzo haya?"))) {
      return;
    }

    try {
      await apiClient.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      if (currentSessionId === sessionId) {
        createNewSession();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const playAIResponse = async (text: string) => {
    if (voiceOption === 'off' || !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) return;

    try {
      setIsPlayingAudio(true);

      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }

      console.log(`Generating speech with ${voiceOption} voice for AI response`);

      // Clean text for better speech synthesis
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
        .replace(/`(.*?)`/g, '$1') // Remove code blocks
        .replace(/\n+/g, '. ') // Replace newlines with periods
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .trim();

      const voiceId = voiceConfigs[voiceOption].voiceId;
      const audioBuffer = await elevenLabsService.textToSpeech(cleanText, voiceId);

      // Create audio blob and URL
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;

      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      setCurrentAudio(audio);
      await audio.play();

    } catch (error) {
      console.warn('Failed to play audio:', error);
      setIsPlayingAudio(false);
    }
  };

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Stop any currently playing audio when user sends a new message
    stopCurrentAudio();

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Send message to backend
      const response = await apiClient.sendMessage(currentSessionId || '', inputMessage);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update session ID if this was a new session
      if (!currentSessionId && response.data?.session?.id) {
        setCurrentSessionId(response.data.session.id);
        // Reload sessions to include the new one
        loadChatSessions();
      }

      // Remove loading message and add actual AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: response.data?.aiMessage?.id || (Date.now() + 2).toString(),
          content: response.data?.response || "I'm sorry, I'm having trouble connecting right now.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
          sessionId: response.data?.session?.id
        }];
      });

      // Play audio response if voice is enabled
      if (voiceOption !== 'off' && response.data?.response) {
        // Small delay to ensure message is rendered before audio starts
        setTimeout(() => {
          if (response.data && response.data.response) {
            playAIResponse(response.data.response);
          }
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text'
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceOptionChange = (option: VoiceOption) => {
    setVoiceOption(option);
    setShowVoiceDropdown(false);

    // Stop current audio if switching to off or changing voice
    if (isPlayingAudio) {
      stopCurrentAudio();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording functionality
  };

  const handleChoice = (choice: 'chat' | 'video') => {
    setShowChoiceModal(false);
    if (choice === 'video') {
      setShowVideoConversation(true);
    }
  };

  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "settings":
        return <div>Settings Component</div>;
      case "introLoading":
        return <Instructions />;
      case "conversation":
        return <Conversation />;
      default:
        return <Instructions />;
    }
  };

  const currentVoiceConfig = voiceConfigs[voiceOption];
  const VoiceIcon = currentVoiceConfig.icon;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{tr("Please Sign In", "Tafadhali Ingia")}</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{tr("You need to be signed in to access the chat.", "Unahitaji kuingia ili kufikia mazungumzo.")}</p>
          <Link href="/auth/signin" className="heal-button">
            {tr("Sign In", "Ingia")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#2C4A4E]/20 via-[#2C4A4E]/20 to-[#2C4A4E]/20" style={{
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="leaves" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="%232C4A4E" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23leaves)"/></svg>')`,
      backgroundSize: '200px 200px'
    }}>
      {/* {showChoiceModal && <ChoiceModal onSelect={handleChoice} />} */}
      {/* Header - Fixed */}
      <div className="backdrop-blur-sm shadow-sm border-b px-3 sm:px-4 py-3 flex-shrink-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#2C4A4E] to-[#2C4A4E] rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white text-sm sm:text-base">{tr("AI Support Companion", "Nia, msaidizi wako wa AI")}</h1>
                <p className="text-xs sm:text-sm text-white flex items-center">
                  {isPlayingAudio ? (
                    <>
                      <Volume2 className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Speaking ({voiceOption} voice)...</span>
                      <span className="sm:hidden">{tr("Speaking...", "Inazungumza...")}</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{tr("Safe space to share - available 24/7", "Mahali salama pa kushiriki - saa 24")}</span>
                      <span className="sm:hidden">{tr("Available", "Yupo")}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Chat Sessions Dropdown */}
            <div className="relative" ref={sessionsRef}>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                title="Chat Sessions"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <ChevronDown className="h-3 w-3 text-white hidden sm:block" />
              </button>

              {showSessions && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 border-b border-gray-200 flex items-center justify-between">
                    <span>{tr("Chat Sessions", "Mazungumzo")}</span>
                    <button
                      onClick={createNewSession}
                      className="text-[#2C4A4E] hover:text-[#2C4A4E] text-xs"
                    >
                      {tr("New Chat", "Mazungumzo Mapya")}
                    </button>
                  </div>

                  {loadingSessions ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-600 text-sm">
                      {tr("No chat sessions yet", "Bado hakuna mazungumzo")}
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group ${currentSessionId === session.id ? 'bg-[#2C4A4E]/10 text-[#2C4A4E]' : 'text-gray-700'
                          }`}
                        onClick={() => selectSession(session.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-600 transition-opacity"
                          title="Delete session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Voice Selection Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${currentVoiceConfig.color}`}
                title={tr(`Current: ${currentVoiceConfig.label}`, `Sasa: ${currentVoiceConfig.label}`)}
              >
                <VoiceIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </button>

              {showVoiceDropdown && (
                <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 text-xs font-medium text-gray-600 border-b border-gray-200">
                    {tr("Voice Options", "Chaguo za Sauti")}
                  </div>
                  {Object.entries(voiceConfigs).map(([key, config]) => {
                    const OptionIcon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleVoiceOptionChange(key as VoiceOption)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${voiceOption === key ? 'bg-[#2C4A4E]/10 text-[#2C4A4E]' : 'text-gray-700'
                          }`}
                      >
                        <OptionIcon className="h-4 w-4" />
                        <span className="text-sm">{config.label}</span>
                        {voiceOption === key && (
                          <div className="ml-auto w-2 h-2 bg-[#2C4A4E] rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                  <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 mt-1">
                    {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
                      ? tr("Powered by ElevenLabs AI", "Inaendeshwa na ElevenLabs AI")
                      : tr("API key required for voice", "Ufunguo wa API unahitajika kwa sauti")
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowVideoConversation(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2C4A4E] px-3 py-2 text-xs sm:text-sm font-semibold text-[#ECE5DA] hover:bg-[#2C4A4E]/90 transition-colors relative"
                title={tr("Start a video conversation with Nia", "Anza mazungumzo ya video na Nia")}
              >
                <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tr("Video with Nia", "Video na Nia")}</span>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500/200 ring-2 ring-white"></span>
              </button>
              {showVideoTooltip && (
                <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 shadow-lg z-20">
                  {tr("Click here for a video chat!", "Bofya hapa kwa mazungumzo ya video!")}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowVideoTooltip(false); }}
                    className="absolute -top-1 -right-1 bg-gray-600 hover:bg-gray-700 rounded-full p-0.5 leading-none"
                  >
                    <X className="h-2 w-2 text-white" />
                  </button>
                </div>
              )}
            </div>
            <Link href="/crisis" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
        {showVideoConversation ? (
          <div className="flex-1 flex flex-col min-h-0 justify-center items-center relative">
            <div className="absolute inset-0 flex flex-col h-full items-center justify-center">
              {renderScreen()}

              {/* Video Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800/80 backdrop-blur-sm rounded-full px-6 py-3">
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                  <Settings className="h-5 w-5 text-white" />
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                  <Mic className="h-5 w-5 text-white" />
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                  <Video className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={() => setShowVideoConversation(false)}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                >
                  <Phone className="h-5 w-5 text-white transform rotate-135" />
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowVideoConversation(false)}
                className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg z-10 transition-all duration-200"
                aria-label="Close video conversation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-h-screen overflow-hidden">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <>
                <div className="w-full max-w-5xl mx-auto  backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative border border-white/20 min-h-[85vh]">

                  {/* Welcome Message */}
                  <div className="relative px-10 py-16 text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Hey!</h3>
                    <h4 className="text-3xl font-semibold text-white/90 mb-16 drop-shadow-md">{tr("Can I help you with anything?", "Naweza kukusaidia kwa lolote?")}</h4>

                    <div className="flex items-center justify-center space-x-4 mb-6 text-white/80">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <p className="text-lg font-medium">{tr("This is a safe space to share your thoughts and feelings", "Hapa ni mahali salama pa kushiriki mawazo na hisia zako")}</p>
                    </div>
                    <p className="text-white/70 text-base mb-16">{tr("Completely without judgement", "Bila hukumu yoyote")}</p>
                  </div>

                  {/* Input Area */}
                  <div className="relative px-10 pb-10">
                    <div className="relative mb-6">
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={tr("Type your message here... Share what's on your mind", "Andika ujumbe wako hapa… Shiriki kilicho moyoni")}
                        className="w-full px-8 py-6 pr-16 rounded-2xl focus:ring-2 focus:ring-white/50 focus:outline-none resize-none bg-white/20 backdrop-blur-md text-white placeholder-white/60 shadow-xl border border-white/30 text-lg"
                        rows={2}
                        disabled={isTyping}
                      />
                      <button
                        onClick={toggleRecording}
                        className="absolute bottom-6 right-6 p-3 text-white/80 hover:text-white bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
                      >
                        <Mic className="h-6 w-6" />
                      </button>
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border border-white/30 text-lg"
                    >
                      {isTyping ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-6 w-6" />
                          <span>{tr("Send Message", "Tuma Ujumbe")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Chat Messages View */
              <div className="w-full max-w-5xl mx-auto backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[85vh] border border-white/20">
                

                {/* Messages Container */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-8 py-6 space-y-6 relative"
                  style={{
                    scrollBehavior: 'smooth',
                    overscrollBehavior: 'contain'
                  }}
                >
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                        <span className="text-white text-lg">{tr("Loading chat history...", "Inapakia historia ya mazungumzo...")}</span>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-4 max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-md border shadow-lg ${message.sender === 'user'
                              ? 'bg-[#2C4A4E]/80 border-[#2C4A4E]/50'
                              : 'bg-white/20 border-white/30'
                            }`}>
                            {message.sender === 'user' ?
                              <User className="h-5 w-5 text-white" /> :
                              <Bot className="h-5 w-5 text-white" />
                            }
                          </div>

                          {/* Message Bubble */}
                          <div className={`px-6 py-4 rounded-2xl backdrop-blur-md border shadow-lg ${message.sender === 'user'
                              ? 'bg-[#2C4A4E]/80 text-white border-[#2C4A4E]/50'
                              : 'bg-white/20 text-white border-white/30'
                            }`}>
                            {message.isLoading ? (
                              <div className="flex items-center space-x-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-base">{tr("Thinking...", "Inafikiri...")}</span>
                              </div>
                            ) : (
                              <>
                                <p className="text-base leading-relaxed break-words">{message.content}</p>
                                <div className="flex items-center justify-between mt-3">
                                  <p className={`text-sm ${message.sender === 'user' ? 'text-[#ECE5DA]' : 'text-white/70'}`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {/* Audio indicator for AI messages */}
                                  {message.sender === 'ai' && voiceOption !== 'off' && !message.isLoading && (
                                    <div className="flex items-center space-x-2">
                                      {isPlayingAudio ? (
                                        <Volume2 className="h-4 w-4 text-white/80" />
                                      ) : (
                                        <VoiceIcon className="h-4 w-4 text-white/60" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="relative px-8 py-6 border-t border-white/20 flex-shrink-0 bg-white/5 backdrop-blur-md">
                  <div className="flex items-end space-x-4">
                    <button
                      onClick={toggleRecording}
                      className={`p-4 rounded-full transition-all duration-200 flex-shrink-0 backdrop-blur-md border shadow-lg ${
                        isRecording
                          ? 'bg-red-500/80 text-white border-red-400/50'
                          : 'bg-white/20 text-white/80 hover:bg-white/30 border-white/30'
                      }`}
                      title={isRecording ? tr("Stop recording", "Acha kurekodi") : tr("Start voice message", "Anza ujumbe wa sauti")}
                    >
                      {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </button>

                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={tr("Type your message...", "Andika ujumbe wako...")}
                        className="w-full px-6 py-4 border border-white/30 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:outline-none resize-none bg-white/20 backdrop-blur-md text-white placeholder-white/60 shadow-lg text-base"
                        rows={1}
                        style={{
                          minHeight: '56px',
                          maxHeight: '140px'
                        }}
                        disabled={isTyping}
                      />
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className={`p-4 rounded-full transition-all duration-200 flex-shrink-0 backdrop-blur-md border shadow-lg ${
                        inputMessage.trim() && !isTyping
                          ? 'bg-white/20 text-white hover:bg-white/30 border-white/30'
                          : 'bg-white/10 text-white/40 cursor-not-allowed border-white/20'
                      }`}
                      title="Send message"
                    >
                      {isTyping ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Send className="h-6 w-6" />
                      )}
                    </button>
                  </div>

                  {/* Quick Response Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {[
                      { en: tr('I need support', 'Nahitaji msaada'), short: tr('Support', 'Msaada') },
                      { en: tr('Feeling unsafe', 'Sijisikii salama'), short: tr('Unsafe', 'Si salama') },
                      { en: tr('Need someone to talk to', 'Nahitaji mtu wa kuongea naye'), short: tr('Talk', 'Ongea') },
                      { en: tr('Having a hard day', 'Nina siku ngumu'), short: tr('Hard day', 'Siku ngumu') }
                    ].map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(option.en)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-colors disabled:opacity-50 backdrop-blur-md border border-white/30 shadow-lg"
                        disabled={isTyping}
                      >
                        {option.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}