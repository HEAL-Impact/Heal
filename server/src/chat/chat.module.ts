import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, ChatMessage, User])],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService], // Export so UssdModule can use it
})
export class ChatModule {}