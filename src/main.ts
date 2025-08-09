import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  const os = await import('os');
  const nets = os.networkInterfaces();
  const results: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  console.log('Server is running on:');
  results.forEach(ip => console.log(`  http://${ip}:${port}`));
  console.log(`  http://localhost:${port}`);
}
bootstrap();
