import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug: Check environment variables at startup
  console.log('=== ENVIRONMENT CHECK ===');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 15)}...` : 'NOT SET');
  console.log('========================');

  const app = await NestFactory.create(AppModule);


  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://localhost:3000'],
    credentials: true,
  });

  
  //This ensures NestJS can read Africa’s Talking form data properly.
   app.use(require('body-parser').urlencoded({ extended: true }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API prefix (exclude USSD for Africa's Talking compatibility)
  app.setGlobalPrefix('api/v1', {
    exclude: ['ussd'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Heal API')
    .setDescription('Mental Health Support Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(` Heal Backend running on http://localhost:${port}`);
  console.log(` API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();