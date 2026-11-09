'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Shield, Phone, MessageCircle, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { geminiService } from '@/lib/ai-services';
import PtsdScreeningFlow from '@/components/screening/PtsdScreeningFlow';
import { checkMessageRisk, type RiskFlag } from '@/lib/help/risk';
import { useLang } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

type GuestTab = 'chat' | 'screening';

const TABS: { id: GuestTab; label: { en: string; sw: string }; icon: typeof MessageCircle }[] = [
  { id: 'chat', label: { en: 'Talk with Nia', sw: 'Ongea na Nia' }, icon: MessageCircle },
  { id: 'screening', label: { en: 'Trauma check', sw: 'Ukaguzi wa kiwewe' }, icon: ClipboardList },
];

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'risk' | 'error';
  timestamp: Date;
  /** Set on 'risk' messages: a support card shown when a message suggests danger. */
  flag?: RiskFlag;
}

export default function AnonymousPage() {
  const { tr } = useLang();
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

    // Checked on the device, so it works even if Nia can't be reached.
    const flag = checkMessageRisk(userMessage.content);
    const riskMessage: Message[] = flag
      ? [{ id: `${userMessage.id}-risk`, content: '', sender: 'risk', timestamp: new Date(), flag }]
      : [];

    setMessages((prev) => [...prev, userMessage, ...riskMessage]);
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
        content: '',
        sender: 'error',
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
    <main className="min-h-screen pb-20 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(254, 245, 227, 0.85), rgba(254, 245, 227, 0.85)), url('/images/forestbg.jpg')" }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href="/help"
          className="flex items-center gap-2 text-brand-primary hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-lg">{tr('Back', 'Rudi')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            href="/my-space"
            className="bg-brand-primary hover:bg-brand-accent text-white px-4 sm:px-6 py-2 rounded-full font-acme text-sm transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            {tr('My Space', 'Nafasi Yangu')}
          </Link>
        </div>
      </header>

      {/* Emergency Contacts Bar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-brand-primary mb-2 font-medium">{tr('Free help lines:', 'Simu za msaada bure:')}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:1195"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">{tr('National GBV Hotline', 'Simu ya Kitaifa ya GBV')}: 1195</span>
            </a>
            <a
              href="tel:0709400200"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">{tr('Gender Violence Recovery Centre', 'Kituo cha Kupona Ukatili wa Kijinsia')}: 0709 400 200</span>
            </a>
            <a
              href="tel:999"
              className="flex items-center gap-2 bg-brand-light/50 hover:bg-brand-light transition-colors px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md"
            >
              <Phone className="h-4 w-4 text-brand-primary" />
              <span className="text-brand-primary font-medium">{tr('Police Gender Desk', 'Dawati la Jinsia la Polisi')}: 999</span>
            </a>
          </div>
        </div>
      </div>

      {/* Guest Mode Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-brand-light/30 px-4 py-3">
        <div role="tablist" aria-label={tr('Choose', 'Chagua')} className="max-w-4xl mx-auto flex justify-center gap-2">
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
              {tr(label)}
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
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-6 mb-6 heal-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-3 rounded-full shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-acme text-brand-primary">{tr('Nia, your AI companion', 'Nia, msaidizi wako wa AI')}</h1>
                <p className="text-sm text-brand-secondary">{tr('A safe, anonymous space to share, any time', 'Mahali salama bila jina pa kushiriki, wakati wowote')}</p>
              </div>
            </div>
            <div className="bg-brand-teal text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
              {tr('Private', 'Faragha')}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto heal-panel">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-brand-light/60 p-6 rounded-full mb-4 shadow-md">
                <Shield className="h-12 w-12 text-brand-primary" />
              </div>
              <h2 className="text-xl font-acme text-brand-primary mb-2">
                {tr('This is a safe space to share your thoughts and feelings', 'Hapa ni mahali salama pa kushiriki mawazo na hisia zako')}
              </h2>
              <p className="text-brand-secondary max-w-md">
                {tr('You can write in English or Kiswahili. Anonymous and confidential.', 'Unaweza kuandika kwa Kiswahili au Kiingereza. Bila jina na kwa siri.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) =>
                message.sender === 'risk' && message.flag ? (
                  <div key={message.id} className="rounded-2xl bg-[#2C4A4E] p-4 text-white shadow-md" role="alert">
                    <p className="font-acme text-lg">{tr(message.flag.title)}</p>
                    <p className="mt-1 text-sm text-white/85">{tr(message.flag.message)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.flag.actions.map((a, i) => (
                        <a
                          key={a.href}
                          href={a.href}
                          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${i === 0 ? 'bg-white text-[#2C4A4E]' : 'border border-white/60 text-white'} hover:bg-white/10`}
                        >
                          {tr(a.label)}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
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
                    <p className="text-sm whitespace-pre-wrap">
                      {message.sender === 'error'
                        ? tr(
                            'Sorry, I couldn’t reply just now. Please try again, or call 1195 if you need help right away.',
                            'Samahani, sikuweza kujibu sasa hivi. Tafadhali jaribu tena, au piga 1195 kama unahitaji msaada mara moja.'
                          )
                        : message.content}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                )
              )}
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
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-4 heal-card">
          <div className="flex items-end gap-3">
            <button
              className="p-3 hover:bg-brand-light/50 rounded-full transition-colors flex-shrink-0"
              title={tr('Voice input (coming soon)', 'Kuongea kwa sauti (inakuja hivi karibuni)')}
              aria-label={tr('Voice input (coming soon)', 'Kuongea kwa sauti (inakuja hivi karibuni)')}
            >
              <Mic className="h-5 w-5 text-brand-gray" />
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={tr('Type your message here…', 'Andika ujumbe wako hapa…')}
              aria-label={tr('Your message', 'Ujumbe wako')}
              className="flex-1 resize-none border border-brand-light bg-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[50px] max-h-[120px] text-brand-primary placeholder:text-brand-gray"
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              aria-label={tr('Send', 'Tuma')}
              className="bg-brand-primary hover:bg-brand-accent disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all flex-shrink-0 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 flex items-start gap-2 text-xs text-brand-secondary">
            <Shield className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <p>
              {tr(
                'Nia is an AI, not a person or a doctor. Nia listens and helps you find options, but can make mistakes. Nothing you type is linked to your name.',
                'Nia ni AI, si mtu wala daktari. Anasikiliza na kukusaidia kupata njia; anaweza kukosea. Unachoandika hakihusishwi na jina lako.'
              )}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-brand-secondary">{tr('Prefer a person?', 'Ungependa kuongea na mtu?')}</span>
            <a href="tel:1195" className="rounded-full bg-brand-light/60 px-3 py-1 font-semibold text-brand-primary hover:opacity-90 hover:shadow-md">{tr('Call 1195', 'Piga 1195')}</a>
            <a href="tel:+254722178177" className="rounded-full bg-brand-light/60 px-3 py-1 font-semibold text-brand-primary hover:opacity-90 hover:shadow-md">Befrienders Kenya</a>
          </div>
        </div>
        </div>
        )}
      </div>
    </main>
  );
}

