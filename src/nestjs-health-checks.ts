// First, install required packages:
// npm install @nestjs/terminus @nestjs/typeorm typeorm @willsoto/nestjs-prometheus fs-extra

// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DiskHealthIndicator } from './health-indicators/disk.health';
import { MemoryHealthIndicator } from './health-indicators/memory.health';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([]), // Add your entities here if needed
  ],
  controllers: [HealthController],
  providers: [HealthService, DiskHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}

// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      return await this.healthCheckService.check([
        () => this.healthService.checkDatabase(),
        () => this.healthService.checkMemory(),
        () => this.healthService.checkDiskSpace(),
      ]);
    } catch (error) {
      // Return a more descriptive error response
      return {
        status: 'error',
        timestamp: new Date(),
        error: {
          message: error.message,
          details: error.response || 'No additional details available',
        },
        services: {
          database: { status: error.databaseStatus || 'unknown' },
          memory: { status: error.memoryStatus || 'unknown' },
          disk: { status: error.diskStatus || 'unknown' },
        },
      };
    }
  }
}

// health.service.ts
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { DiskHealthIndicator } from './health-indicators/disk.health';
import { MemoryHealthIndicator } from './health-indicators/memory.health';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private connection: Connection,
    private diskHealthIndicator: DiskHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      // Test the database connection
      await this.connection.query('SELECT 1');
      return {
        database: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      };
    } catch (error) {
      throw new HealthCheckError(
        'Database health check failed',
        {
          database: {
            status: 'down',
            message: error.message,
            error: error,
          },
        },
      );
    }
  }

  async checkMemory(): Promise<HealthIndicatorResult> {
    try {
      return await this.memoryHealthIndicator.check('memory');
    } catch (error) {
      throw new HealthCheckError(
        'Memory health check failed',
        {
          memory: {
            status: 'down',
            message: error.message,
            error: error,
          },
        },
      );
    }
  }

  async checkDiskSpace(): Promise<HealthIndicatorResult> {
    try {
      return await this.diskHealthIndicator.check('disk');
    } catch (error) {
      throw new HealthCheckError(
        'Disk space health check failed',
        {
          disk: {
            status: 'down',
            message: error.message,
            error: error,
          },
        },
      );
    }
  }
}

// health-indicators/memory.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  constructor() {
    super();
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    // Thresholds: Consider unhealthy if memory usage is above 90%
    const isHealthy = memoryUsagePercent < 90;

    return this.getStatus(key, isHealthy, {
      usedMemoryPercentage: memoryUsagePercent.toFixed(2) + '%',
      freeMemory: this.formatBytes(freeMemory),
      totalMemory: this.formatBytes(totalMemory),
    });
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
  }
}

// health-indicators/disk.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class DiskHealthIndicator extends HealthIndicator {
  constructor() {
    super();
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      // Get disk usage information for the directory where the application is running
      const diskInfo = await this.getDiskInfo(process.cwd());
      
      // Thresholds: Consider unhealthy if disk usage is above 90%
      const isHealthy = diskInfo.usedPercentage < 90;

      return this.getStatus(key, isHealthy, {
        usedPercentage: diskInfo.usedPercentage.toFixed(2) + '%',
        free: this.formatBytes(diskInfo.free),
        size: this.formatBytes(diskInfo.size),
        path: diskInfo.path,
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: 'Failed to check disk space',
        error: error.message,
      });
    }
  }

  private async getDiskInfo(directory: string): Promise<{
    size: number;
    free: number;
    usedPercentage: number;
    path: string;
  }> {
    // This approach only works on Linux/Unix systems - you might need a platform-specific solution
    // For Windows, consider using a package like 'diskusage' or creating a platform-specific implementation
    
    try {
      // Use path.resolve to get the absolute path
      const resolvedPath = path.resolve(directory);
      
      // On Linux/Unix, you can check disk space with the df command
      // For a cross-platform solution in production, consider using a library like 'diskusage'
      // This is a simplified implementation that works on most Unix-like systems
      
      const stats = await fs.statfs(resolvedPath);
      
      const size = stats.blocks * stats.bsize;
      const free = stats.bfree * stats.bsize;
      const used = size - free;
      const usedPercentage = (used / size) * 100;
      
      return {
        size,
        free,
        usedPercentage,
        path: resolvedPath,
      };
    } catch (error) {
      // Fallback to a simple check if the above method fails
      // This doesn't provide disk space info but at least checks if the directory is accessible
      await fs.access(directory);
      
      return {
        size: 0,
        free: 0,
        usedPercentage: 0,
        path: directory,
      };
    }
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
  }
}

// app.module.ts - How to include the health module in your application
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Your database configuration
      type: 'postgres', // or your database type
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'app',
      entities: [],
      synchronize: false, // Set to false in production
    }),
    HealthModule,
  ],
})
export class AppModule {}

// main.ts - Example of graceful shutdown
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Application');
  
  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    logger.log('Application shutting down...');
    await app.close();
    logger.log('Application shut down successfully');
    process.exit(0);
  });
  
  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();