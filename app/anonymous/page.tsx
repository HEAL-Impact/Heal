'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Shield, Phone, MessageCircle, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { geminiService } from '@/lib/ai-services';
import PtsdScreeningFlow from '@/components/screening/PtsdScreeningFlow';

type GuestTab = 'chat' | 'screening';

const TABS: { id: GuestTab; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chat', label: 'AI Companion', icon: MessageCircle },
  { id: 'screening', label: 'PTSD Screening', icon: ClipboardList },
];

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AnonymousPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<GuestTab>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Read the tab from the URL after mount so the static export renders the same HTML on server and client.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'screening') setActiveTab('screening');
  }, []);

  const selectTab = (tab: GuestTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'chat') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await geminiService.sendMessage(inputMessage.trim());
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again or contact one of the emergency hotlines above if you need immediate assistance.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(254, 245, 227, 0.85), rgba(254, 245, 227, 0.85)), url('/images/forestbg.jpg')" }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-primary hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-acme text-lg">Home</span>
        </Link>

        <Link
          href="/auth/signup"
          className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-2 rounded-full font-acme text-sm transition-all shadow-md hover:shadow-lg hover:scale-105"
        >
          Sign Up for Full Access
        </Link>
      </header>

      {/* Emergency Contacts Bar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-brand-primary mb-2 font-medium font-acme">Emergency Contacts:</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:1195"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">National GBV Hotline: 1195</span>
            </a>
            <a
              href="tel:0709400200"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">Gender Violence Recovery Centre: 0709 400 200</span>
            </a>
            <a
              href="tel:999"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">Police Gender Desk: 999</span>
            </a>
          </div>
        </div>
      </div>

      {/* Guest Mode Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3">
        <div role="tablist" aria-label="Guest mode" className="max-w-4xl mx-auto flex justify-center gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`guest-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`guest-panel-${id}`}
              onClick={() => selectTab(id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-acme text-sm transition-all ${
                activeTab === id
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-white/70 text-brand-primary hover:bg-brand-light shadow-sm'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'screening' ? (
          <div role="tabpanel" id="guest-panel-screening" aria-labelledby="guest-tab-screening">
            <PtsdScreeningFlow userId={null} onChatWithNia={() => selectTab('chat')} />
          </div>
        ) : (
        <div role="tabpanel" id="guest-panel-chat" aria-labelledby="guest-tab-chat">
        {/* AI Support Companion Header */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-3 rounded-full shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-acme text-brand-primary">AI Support Companion</h1>
                <p className="text-sm text-brand-secondary">Safe, anonymous space to share - available 24/7</p>
              </div>
            </div>
            <div className="bg-brand-teal text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
              Private
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-brand-light/60 p-6 rounded-full mb-4 shadow-md">
                <Shield className="h-12 w-12 text-brand-primary" />
              </div>
              <h2 className="text-xl font-acme text-brand-primary mb-2">
                This is a safe space to share your thoughts and feelings
              </h2>
              <p className="text-brand-secondary max-w-md">
                Completely anonymous and confidential
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                      message.sender === 'user'
                        ? 'bg-brand-primary text-white'
                        : 'bg-brand-light/70 text-brand-primary border border-brand-light'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-brand-light/70 text-brand-primary rounded-2xl px-4 py-3 shadow-md border border-brand-light">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-4">
          <div className="flex items-end gap-3">
            <button
              className="p-3 hover:bg-brand-light/50 rounded-full transition-colors flex-shrink-0"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5 text-brand-gray" />
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... Share what's on your mind"
              className="flex-1 resize-none border border-brand-light bg-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[50px] max-h-[120px] text-brand-primary placeholder:text-brand-gray"
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-brand-primary hover:bg-brand-accent disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all flex-shrink-0 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 flex items-start gap-2 text-xs text-brand-secondary">
            <Shield className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <p>
              This AI companion provides emotional support. For crisis situations, please use the emergency hotlines above.
            </p>
          </div>
        </div>
        </div>
        )}
      </div>
    </main>
  );
}

