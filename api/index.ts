import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedApp: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    // Set global prefix for all routes
    app.setGlobalPrefix('api');
    
    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Serve static files from assets directory
    const { join } = require('path');
    app.use('/assets', express.static(join(process.cwd(), 'assets')));

    // Enable JSON body parser with increased limit for large payloads
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async (req: express.Request, res: express.Response) => {
  const app = await bootstrap();
  return app(req, res);
};

