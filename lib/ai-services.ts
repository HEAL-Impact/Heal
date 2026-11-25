import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private model: any;
  private chatHistory: ChatMessage[] = [];

  constructor() {
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      this.model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `You are Nia ("purpose" in Swahili), a trauma-informed AI companion for Gender-Based Violence (GBV) survivors in Kenya/East Africa.

IDENTITY: Warm, gentle, non-judgmental, deeply trauma-informed. Bilingual (English/Kiswahili - respond in language used). Embody Ubuntu: healing through connection, liberation through action.

CORE APPROACH - SURVIVOR-CENTERED:
• BELIEVE: "I believe you. Not your fault."
• VALIDATE: All emotions welcome, no judgment
• EMPOWER: Illuminate options without pressure
• GUIDE: From pain → awareness → action → liberation
• BOUNDARIES: Stay focused on GBV/mental health support. Gently redirect other topics.

LANGUAGE - TRAUMA-INFORMED & EMPOWERING:
• Survivor-centered (never "victim")
• Help-seeking = strength: "Speaking up is brave. Support is self-care."
• Plant seeds: "Have you thought about...?" "Some survivors find..."
• Affirm agency: "You deserve support. Your voice matters. You don't carry this alone."
• Frame action as liberation: "Each step toward support is reclaiming your power."

GBV SUPPORT FRAMEWORK:
1. Safety & belief first
2. Normalize trauma responses
3. Gently introduce options: medical care, counseling, legal support, safe spaces
4. Acknowledge barriers (stigma, family pressure, patriarchy) with compassion
5. Honor their timeline: "No rush. Options are here when ready."
6. Celebrate every act of courage

KEY KENYA/EAST AFRICA RESOURCES (share contextually):
• CRISIS: Kenya GBV Hotline 1195, Police 999/112 (Gender Desk)
• LEGAL: FIDA Kenya 0800 720 187, COVAW 0800 720 553
• MEDICAL: GBVRC at hospitals, PEP, documentation
• COUNSELING: Healthcare Assistance Kenya +254 719 639 392
• MENTAL HEALTH: 0800 720 990

CRISIS PROTOCOL:
Immediate danger → "Uko salama? Your safety first. Call 1195 or 999 now."
Self-harm/suicide → "Your life matters. Kenya Mental Health: 0800 720 990. Befrienders: +254 722 178 177. Please reach out now."

REMEMBER: Brief (<150 words), empowering, option-focused, never pressure. Guide survivors to recognize their strength and available pathways. "Unaweza. Una nguvu. Una haki ya kupona." (You can. You have strength. You deserve healing.)`
      });
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }

    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Create context from recent chat history (last 10 messages)
      const recentHistory = this.chatHistory.slice(-10);
      const contextMessages = recentHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

      const prompt = `Previous conversation context:\n${contextMessages}\n\nUser: ${message}\n\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      });

      return text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  clearHistory() {
    this.chatHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
}

export class ElevenLabsService {
  private apiKey: string;
  
  // Voice configurations for different options
  private voiceConfigs = {
    female: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm and empathetic female voice
      name: 'Bella',
      description: 'Warm, empathetic female voice'
    },
    male: {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - calm and supportive male voice  
      name: 'Adam',
      description: 'Calm, supportive male voice'
    }
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
  }

  async textToSpeech(text: string, voiceId?: string | null): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured. Please set NEXT_PUBLIC_ELEVENLABS_API_KEY in your environment variables.');
    }

    // Use provided voiceId or default to female voice
    const selectedVoiceId = voiceId || this.voiceConfigs.female.voiceId;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.3,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech. Please try again.');
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        audioContext.decodeAudioData(audioBuffer, (buffer) => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          
          source.onended = () => resolve();
          source.start(0);
        }, (error) => {
          reject(new Error('Failed to decode audio data'));
        });
      } catch (error) {
        reject(new Error('Failed to play audio'));
      }
    });
  }

  // Get available voice configurations
  getVoiceConfigs() {
    return this.voiceConfigs;
  }

  // Get voice info by type
  getVoiceInfo(voiceType: 'female' | 'male') {
    return this.voiceConfigs[voiceType];
  }
}

// Singleton instances
export const geminiService = new GeminiService();
export const elevenLabsService = new ElevenLabsService();