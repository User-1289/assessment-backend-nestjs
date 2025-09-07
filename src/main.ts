import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // if you need cookies/auth headers
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Server running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();