// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'AI-Nexus Backend is running successfully',
      timestamp: new Date().toISOString(),
      service: 'AI-Nexus Backend',
      version: '1.0.0',
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      message: 'Backend is running successfully',
      timestamp: new Date().toISOString(),
      service: 'AI-Nexus Backend',
    };
  }
}

