// src/audit/interceptors/audit-log.interceptor.ts
import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler,
  Inject
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../audit-log.service';
import { AuditAction } from '../entities/audit-log.entity';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_METADATA = 'audit_log_metadata';

export interface AuditLogMetadata {
  resource: string;
  getResourceId: (request: any, response: any) => string;
  actions: {
    POST?: AuditAction;
    PUT?: AuditAction;
    PATCH?: AuditAction;
    DELETE?: AuditAction;
  };
  getBeforeEntity?: (request: any) => Promise<any>;
}

export const AuditLog = (metadata: AuditLogMetadata) => {
  return (target: any) => {
    Reflect.defineMetadata(AUDIT_LOG_METADATA, metadata, target);
    return target;
  };
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_METADATA,
      context.getClass(),
    );

    if (!metadata) {
      return next.handle();
    }

    const method = request.method;
    const action = metadata.actions[method];
    
    if (!action) {
      return next.handle();
    }

    // Get user from request
    const userId = request.user?.id;
    if (!userId) {
      return next.handle();
    }

    let beforeEntity = null;
    if (action === AuditAction.UPDATE || action === AuditAction.DELETE) {
      if (metadata.getBeforeEntity) {
        beforeEntity = await metadata.getBeforeEntity(request);
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const resourceId = metadata.getResourceId(request, response);
          
          await this.auditLogService.create({
            resource: metadata.resource,
            resourceId,
            userId,
            action,
            before: beforeEntity,
            after: action !== AuditAction.DELETE ? response : null,
          });
        } catch (error) {
          console.error('Failed to create audit log', error);
        }
      }),
    );
  }
}
