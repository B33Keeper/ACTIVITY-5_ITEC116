import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global error handler for multer file validation
  app.use((err: any, req: any, res: any, next: any) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        statusCode: 400,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (err && err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        statusCode: 400,
        message: err.message || 'Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP',
      });
    }
    next(err);
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Allow requests from the React dev server
  app.enableCors({ origin: true });

  const config = new DocumentBuilder()
    .setTitle('Activity5 Blog API')
    .setDescription('Blog API with users, posts, comments, and auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
