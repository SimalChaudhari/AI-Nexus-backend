import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  try {
   
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3000;
    
    // Set global prefix for all routes (except root)
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

    // Root route handler (before app.listen) - returns health check
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/', (req: express.Request, res: express.Response) => {
      res.json({
        status: 'ok',
        message: 'AI-Nexus Backend is running successfully',
        timestamp: new Date().toISOString(),
        service: 'AI-Nexus Backend',
        version: '1.0.0',
      });
    });

    await app.listen(port);
    console.log(`Server is running on: http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/`);
    console.log(`API routes: http://localhost:${port}/api`);

  } catch (error) {
    process.exit(1); // Exit the process with failure
  }
}
bootstrap();

