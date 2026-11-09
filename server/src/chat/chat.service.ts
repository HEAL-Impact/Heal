import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    // Initialize Gemini AI (same as frontend video chat)
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    console.log(' GEMINI_API_KEY present:', !!apiKey);
    console.log(' GEMINI_API_KEY value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
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

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    const { sessionId, content, messageType = 'text' } = sendMessageDto;
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create session
    let session: ChatSession;
    if (sessionId) {
      session = await this.chatSessionRepository.findOne({
        where: { id: sessionId, user: { id: userId } },
        relations: ['user'],
      });
      if (!session) {
        throw new NotFoundException('Session not found');
      }
    } else {
      // Create new session
      session = this.chatSessionRepository.create({
        title: `Chat Session - ${new Date().toLocaleDateString()}`,
        user,
      });
      session = await this.chatSessionRepository.save(session);
    }

    // Save user message
    const userMessage = this.chatMessageRepository.create({
      content,
      senderType: 'user',
      messageType,
      session,
      user,
    });
    await this.chatMessageRepository.save(userMessage);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(content);

    // Save AI message
    const aiMessage = this.chatMessageRepository.create({
      content: aiResponse,
      senderType: 'ai',
      messageType: 'text',
      session,
      user,
      metadata: JSON.stringify({
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        userMessageId: userMessage.id,
      }),
    });
    await this.chatMessageRepository.save(aiMessage);

    return {
      session: {
        id: session.id,
        userId: session.user.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        senderType: userMessage.senderType,
        messageType: userMessage.messageType,
        createdAt: userMessage.createdAt,
      },
      aiMessage: {
        id: aiMessage.id,
        content: aiMessage.content,
        senderType: aiMessage.senderType,
        messageType: aiMessage.messageType,
        createdAt: aiMessage.createdAt,
      },
      response: aiResponse,
    };
  }

  async getChatHistory(userId: string, sessionId: string, limit = 50, offset = 0) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const messages = await this.chatMessageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      messages: messages.map(msg => ({
        id: msg.id,
        sessionId: msg.session.id,
        userId: msg.user.id,
        content: msg.content,
        senderType: msg.senderType,
        messageType: msg.messageType,
        createdAt: msg.createdAt,
      })),
    };
  }

  async getChatSessions(userId: string, limit = 20, offset = 0) {
    const sessions = await this.chatSessionRepository.find({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      sessions: sessions.map(session => ({
        id: session.id,
        userId: session.user.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    };
  }

  async deleteChatSession(userId: string, sessionId: string) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.chatSessionRepository.remove(session);
    return { message: 'Session deleted successfully' };
  }

  async generateAIResponse(message: string): Promise<string> {
    //  Use Google Generative AI SDK (same as frontend video chat)
    if (!this.model) {
      console.error(' Gemini AI not initialized. GEMINI_API_KEY missing.');
      console.error(' Falling back to default responses');
      return this.getFallbackResponse(message);
    }

    try {
      console.log(' Sending message to Gemini AI:', message.substring(0, 50) + '...');

      // Add timeout to prevent hanging (important for USSD 10-sec limit)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 8000)
      );

      const aiPromise = this.model.generateContent(message);

      const result = await Promise.race([aiPromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      console.log(' Gemini AI response received:', text.substring(0, 100) + '...');
      return text;
    } catch (error) {
      console.error(' Gemini AI error:', error.message || error);
      console.error(' Error details:', JSON.stringify(error, null, 2));
      console.error(' Falling back to default responses');
      // Graceful fallback for rate limits, timeouts, or errors
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // GBV-specific responses
    if (lowerMessage.includes('abuse') || lowerMessage.includes('violence') || lowerMessage.includes('hurt')) {
      return "I believe you. What happened is not your fault. You deserve safety and support. Kenya GBV Hotline: 1195 (toll-free, 24/7). FIDA Kenya: 0800 720 187. You don't have to carry this alone.";
    }

    if (lowerMessage.includes('scared') || lowerMessage.includes('afraid') || lowerMessage.includes('fear')) {
      return "Your fear is valid. Safety comes first. If you're in immediate danger, please call 999 or 1195. I'm here to support you. What would help you feel safer right now?";
    }

    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
      return "Anxiety after trauma is your body trying to protect you. It's exhausting, and you're doing your best. Grounding can help: Name 5 things you see, 4 you hear, 3 you touch. Kenya Mental Health: 0800 720 990. Unakwenda vizuri. (You're doing okay.)";
    }

    if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return "I hear you, and your feelings make sense. Trauma can make everything feel heavy. You're not alone. Befrienders Kenya: +254 722 178 177. Healthcare Assistance: +254 719 639 392. Small steps count. Una nguvu. (You have strength.)";
    }

    // Default GBV-informed responses
    const responses = [
      "You've taken a brave step by reaching out. I'm Nia, and I'm here to listen without judgment. You're safe here. What's on your mind?",
      "I believe you, and I'm here for you. Whatever you share stays between us. How can I support you today?",
      "Thank you for trusting me with this. Your feelings are completely valid. What would help you feel more supported right now?",
      "I'm listening. You don't have to go through this alone. Take your time - I'm here. Uko salama. (You're safe.)",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}