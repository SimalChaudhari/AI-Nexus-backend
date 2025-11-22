import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  try {
   
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3000;
    
    // Set global prefix for all routes
    app.setGlobalPrefix('api');
    
    // Enable CORS
    app.enableCors({
      origin: '*', // Replace with your frontend URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Serve static files from assets directory
    app.use('/assets', express.static(join(process.cwd(), 'assets')));

    // Enable JSON body parser with increased limit for large payloads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    await app.listen(port);
    console.log(`Server is running on: http://localhost:${port}/api`); // Log the port

  } catch (error) {
    process.exit(1); // Exit the process with failure
  }
}
bootstrap();

