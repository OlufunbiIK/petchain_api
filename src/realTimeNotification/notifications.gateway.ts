// FILE: src/realTimeNotification/notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WsException,
  } from '@nestjs/websockets';
  import { Logger, UseGuards } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // In production, specify your client domains
    },
  })
  export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
    private logger = new Logger('NotificationsGateway');
    private userSocketMap = new Map<string, string[]>();
    private readonly connectedClients = new Map<string, Socket>();
    private readonly userRoles = new Map<string, string[]>();
    
    constructor(private readonly jwtService: JwtService) {}
  
    afterInit() {
      this.logger.log('Notifications WebSocket Gateway Initialized');
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
      this.connectedClients.set(client.id, client);
      
      // Authenticate client if token provided in handshake
      try {
        const token = client.handshake.auth.token || client.handshake.headers.authorization;
        
        if (token) {
          const payload = this.jwtService.verify(token);
          if (payload && payload.userId) {
            // Auto-register user with their role if JWT contains this info
            this.registerUserFromJwt(client, payload.userId, payload.roles || []);
          }
        }
      } catch (error) {
        this.logger.warn(`Authentication error for client ${client.id}: ${error.message}`);
        // We don't disconnect here, allowing anonymous connection until register message
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
      
      // Remove client from maps
      this.connectedClients.delete(client.id);
      
      // Remove client from userSocketMap
      this.userSocketMap.forEach((sockets, userId) => {
        const index = sockets.indexOf(client.id);
        if (index !== -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            this.userSocketMap.delete(userId);
          }
        }
      });
    }
    
    private registerUserFromJwt(client: Socket, userId: string, roles: string[]) {
      // Register user to their socket
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      
      if (this.userSocketMap.get(userId)) {
        this.userSocketMap.get(userId)!.push(client.id);
      }
      
      // Store user roles
      this.userRoles.set(userId, roles);
      
      // Join role-based rooms
      roles.forEach(role => {
        client.join(role);
      });
      
      this.logger.log(`User ${userId} auto-registered from JWT with roles: ${roles.join(', ')}`);
    }
  
    @SubscribeMessage('register')
    handleRegister(client: Socket, payload: { userId: string, userType: 'owner' | 'vet' | 'admin', token?: string }) {
      const { userId, userType, token } = payload;
      
      // Optional JWT verification if provided
      if (token) {
        try {
          const decodedToken = this.jwtService.verify(token);
          if (decodedToken.userId !== userId) {
            this.logger.warn(`Token user ID mismatch for socket ${client.id}`);
            throw new WsException('Invalid credentials');
          }
        } catch (error) {
          this.logger.error(`Token verification failed: ${error.message}`);
          return { success: false, error: 'Authentication failed' };
        }
      }
      
      // Store client connection based on user ID
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      
      if (this.userSocketMap.get(userId)) {
        this.userSocketMap.get(userId)!.push(client.id);
      }
      
      // Store user role
      if (!this.userRoles.has(userId)) {
        this.userRoles.set(userId, []);
      }
      
      if (this.userRoles.get(userId) && !this.userRoles.get(userId)!.includes(userType)) {
        this.userRoles.get(userId)!.push(userType);
      }
      
      // Add to room for this user type
      client.join(userType);
      
      // Add to a user-specific room for direct targeting
      client.join(`user:${userId}`);
      
      this.logger.log(`User ${userId} (${userType}) registered on socket ${client.id}`);
      
      // Send any pending notifications
      client.emit('connection_successful', { 
        userId, 
        userType,
        timestamp: new Date().toISOString()
      });
      
      return { success: true };
    }
    
    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, payload: { topics: string[] }) {
      const { topics } = payload;
      
      if (!Array.isArray(topics)) {
        return { success: false, error: 'Topics must be an array' };
      }
      
      // Join each topic room
      topics.forEach(topic => {
        if (typeof topic === 'string' && topic.trim()) {
          client.join(topic);
        }
      });
      
      this.logger.log(`Client ${client.id} subscribed to topics: ${topics.join(', ')}`);
      
      return { success: true, topics };
    }
  
    // Send to specific user by ID
    sendToUser(userId: string, event: string, data: any): boolean {
      const socketIds = this.userSocketMap.get(userId);
      if (socketIds?.length) {
        socketIds.forEach(socketId => {
          this.server.to(socketId).emit(event, data);
        });
        return true;
      }
      return false;
    }
  
    // Send to all users of a specific type (owners or vets)
    sendToUserType(userType: 'owner' | 'vet', event: string, data: any): boolean {
      this.server.to(userType).emit(event, data);
      return true;
    }
  
    // Generic broadcast to all connected clients
    broadcastAll(event: string, data: any): void {
      this.server.emit(event, data);
    }
  }
  
  // FILE: src/realTimeNotification/dto/notification.dto.ts
  export enum NotificationType {
    VACCINATION_DUE = 'vaccination_due',
    NEW_TREATMENT = 'new_treatment',
    APPOINTMENT_SCHEDULED = 'appointment_scheduled',
    APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
    APPOINTMENT_CANCELLED = 'appointment_cancelled',
    MEDICATION_REMINDER = 'medication_reminder',
    TEST_RESULTS_READY = 'test_results_ready',
    EMERGENCY_ALERT = 'emergency_alert',
    INVENTORY_LOW = 'inventory_low',
  }
  
  export class NotificationDto {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    recipientId: string;
    recipientType: 'owner' | 'vet';
    entityId?: string; // ID of related entity (pet, appointment, etc.)
    metadata?: Record<string, any>;
    createdAt: Date;
  }
  
  // FILE: src/realTimeNotification/notifications.service.ts
  import { Injectable, Logger } from '@nestjs/common';
  import { NotificationsGateway } from './notifications.gateway';
  import { NotificationDto, NotificationType } from './dto/notification.dto';
  import { v4 as uuidv4 } from 'uuid';
  
  @Injectable()
  export class NotificationsService {
    private logger = new Logger('NotificationsService');
  
    constructor(private notificationsGateway: NotificationsGateway) {}
  
    // Send vaccination due notification
    async sendVaccinationDueNotification(
      petId: string, 
      petName: string, 
      ownerId: string, 
      vaccinationType: string,
      dueDate: Date
    ) {
      const notification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.VACCINATION_DUE,
        title: 'Vaccination Due',
        message: `${petName}'s ${vaccinationType} vaccination is due on ${dueDate.toLocaleDateString()}`,
        recipientId: ownerId,
        recipientType: 'owner',
        entityId: petId,
        metadata: {
          vaccinationType,
          dueDate: dueDate.toISOString(),
        },
        createdAt: new Date(),
      };
  
      const delivered = this.notificationsGateway.sendToUser(
        ownerId,
        'notification',
        notification,
      );
  
      this.logger.log(
        `Vaccination due notification for pet ${petId} ${
          delivered ? 'delivered' : 'queued for delivery'
        } to owner ${ownerId}`,
      );
  
      return notification;
    }
  
    // Send new treatment notification
    async sendNewTreatmentNotification(
      petId: string,
      petName: string,
      ownerId: string,
      treatmentName: string,
      vetId: string,
    ) {
      const notification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.NEW_TREATMENT,
        title: 'New Treatment Added',
        message: `A new treatment (${treatmentName}) has been added for ${petName}`,
        recipientId: ownerId,
        recipientType: 'owner',
        entityId: petId,
        metadata: {
          treatmentName,
          vetId,
        },
        createdAt: new Date(),
      };
  
      const delivered = this.notificationsGateway.sendToUser(
        ownerId,
        'notification',
        notification,
      );
  
      this.logger.log(
        `New treatment notification for pet ${petId} ${
          delivered ? 'delivered' : 'queued for delivery'
        } to owner ${ownerId}`,
      );
  
      return notification;
    }
  
    // Send appointment rescheduled notification
    async sendAppointmentRescheduledNotification(
      appointmentId: string,
      ownerId: string,
      vetId: string,
      petName: string,
      oldDateTime: Date,
      newDateTime: Date,
    ) {
      // Notification for owner
      const ownerNotification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.APPOINTMENT_RESCHEDULED,
        title: 'Appointment Rescheduled',
        message: `Your appointment for ${petName} has been rescheduled from ${oldDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`,
        recipientId: ownerId,
        recipientType: 'owner',
        entityId: appointmentId,
        metadata: {
          oldDateTime: oldDateTime.toISOString(),
          newDateTime: newDateTime.toISOString(),
          vetId,
        },
        createdAt: new Date(),
      };
  
      // Notification for vet
      const vetNotification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.APPOINTMENT_RESCHEDULED,
        title: 'Appointment Rescheduled',
        message: `Appointment for ${petName} has been rescheduled from ${oldDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`,
        recipientId: vetId,
        recipientType: 'vet',
        entityId: appointmentId,
        metadata: {
          oldDateTime: oldDateTime.toISOString(),
          newDateTime: newDateTime.toISOString(),
          ownerId,
        },
        createdAt: new Date(),
      };
  
      // Send to both owner and vet
      const ownerDelivered = this.notificationsGateway.sendToUser(
        ownerId,
        'notification',
        ownerNotification,
      );
  
      const vetDelivered = this.notificationsGateway.sendToUser(
        vetId,
        'notification',
        vetNotification,
      );
  
      this.logger.log(
        `Appointment reschedule notification ${
          ownerDelivered ? 'delivered' : 'queued for delivery'
        } to owner ${ownerId} and ${
          vetDelivered ? 'delivered' : 'queued for delivery'
        } to vet ${vetId}`,
      );
  
      return {
        ownerNotification,
        vetNotification,
      };
    }
  
    // Send medication reminder notification
    async sendMedicationReminderNotification(
      petId: string,
      petName: string,
      ownerId: string,
      medicationName: string,
      dosage: string,
      reminderTime: Date,
      instructions?: string,
    ) {
      const notification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.MEDICATION_REMINDER,
        title: 'Medication Reminder',
        message: `Time to give ${petName} their ${medicationName} (${dosage})${
          instructions ? `. ${instructions}` : ''
        }`,
        recipientId: ownerId,
        recipientType: 'owner',
        entityId: petId,
        metadata: {
          medicationName,
          dosage,
          reminderTime: reminderTime.toISOString(),
          instructions,
        },
        createdAt: new Date(),
      };
  
      const delivered = this.notificationsGateway.sendToUser(
        ownerId,
        'notification',
        notification,
      );
  
      this.logger.log(
        `Medication reminder notification for pet ${petId} ${
          delivered ? 'delivered' : 'queued for delivery'
        } to owner ${ownerId}`,
      );
  
      return notification;
    }
  
    // Send test results ready notification
    async sendTestResultsReadyNotification(
      testId: string,
      petId: string,
      petName: string,
      ownerId: string,
      vetId: string,
      testType: string,
      resultSummary: string,
      resultDate: Date,
    ) {
      // Notification for owner
      const ownerNotification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.TEST_RESULTS_READY,
        title: 'Test Results Ready',
        message: `${petName}'s ${testType} test results are ready: ${resultSummary}`,
        recipientId: ownerId,
        recipientType: 'owner',
        entityId: testId,
        metadata: {
          petId,
          testType,
          resultDate: resultDate.toISOString(),
          vetId,
        },
        createdAt: new Date(),
      };
  
      // Notification for vet
      const vetNotification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.TEST_RESULTS_READY,
        title: 'Test Results Ready',
        message: `${petName}'s ${testType} test results are ready: ${resultSummary}`,
        recipientId: vetId,
        recipientType: 'vet',
        entityId: testId,
        metadata: {
          petId,
          testType,
          resultDate: resultDate.toISOString(),
          ownerId,
        },
        createdAt: new Date(),
      };
  
      // Send to both owner and vet
      const ownerDelivered = this.notificationsGateway.sendToUser(
        ownerId,
        'notification',
        ownerNotification,
      );
  
      const vetDelivered = this.notificationsGateway.sendToUser(
        vetId,
        'notification',
        vetNotification,
      );
  
      this.logger.log(
        `Test results notification ${
          ownerDelivered ? 'delivered' : 'queued for delivery'
        } to owner ${ownerId} and ${
          vetDelivered ? 'delivered' : 'queued for delivery'
        } to vet ${vetId}`,
      );
  
      return {
        ownerNotification,
        vetNotification,
      };
    }
  
    // Send emergency alert notification
    async sendEmergencyAlertNotification(
      clinicId: string,
      alertType: string,
      message: string,
      severity: 'low' | 'medium' | 'high' | 'critical',
      affectedRoles: ('owner' | 'vet' | 'admin')[],
    ) {
      const notification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.EMERGENCY_ALERT,
        title: `${severity.toUpperCase()} ALERT: ${alertType}`,
        message: message,
        recipientId: 'ALL', // Special case - will be handled differently
        recipientType: 'system',
        entityId: clinicId,
        metadata: {
          alertType,
          severity,
          affectedRoles,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
      };
  
      let delivered = false;
  
      // Send to all affected role groups
      for (const role of affectedRoles) {
        if (role === 'owner' || role === 'vet') {
          this.notificationsGateway.sendToUserType(role, 'emergency_alert', notification);
          delivered = true;
        }
      }
  
      this.logger.log(
        `Emergency alert notification ${
          delivered ? 'broadcast' : 'failed to broadcast'
        } to affected roles: ${affectedRoles.join(', ')}`,
      );
  
      return notification;
    }
  
    // Send inventory low notification
    async sendInventoryLowNotification(
      itemId: string,
      itemName: string,
      currentStock: number,
      minThreshold: number,
      urgent: boolean,
    ) {
      const notification: NotificationDto = {
        id: uuidv4(),
        type: NotificationType.INVENTORY_LOW,
        title: urgent ? 'URGENT: Inventory Critical' : 'Inventory Low',
        message: `${itemName} stock is low (${currentStock} remaining, threshold: ${minThreshold})`,
        recipientId: 'STAFF', // Special case for staff notifications
        recipientType: 'vet', // Assuming vets handle inventory - adjust as needed
        entityId: itemId,
        metadata: {
          itemName,
          currentStock,
          minThreshold,
          urgent,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
      };
  
      // Send to all vet staff
      const delivered = this.notificationsGateway.sendToUserType(
        'vet',
        urgent ? 'urgent_inventory' : 'notification',
        notification,
      );
  
      this.logger.log(
        `Inventory low notification for ${itemName} ${
          delivered ? 'broadcast' : 'failed to broadcast'
        } to vet staff`,
      );
  
      return notification;
    }
  }
  
  // FILE: src/realTimeNotification/notifications.module.ts
  import { Module } from '@nestjs/common';
  import { NotificationsService } from './notifications.service';
  import { NotificationsGateway } from './notifications.gateway';
  
  @Module({
    providers: [NotificationsGateway, NotificationsService],
    exports: [NotificationsService],
  })
  export class NotificationsModule {}
  
  // FILE: src/realTimeNotification/events.service.ts
  import { Injectable, Logger } from '@nestjs/common';
  import { EventEmitter2 } from '@nestjs/event-emitter';
  
  export enum PetClinicEventType {
    VACCINATION_DUE = 'vaccination.due',
    VACCINATION_CREATED = 'vaccination.created',
    TREATMENT_ADDED = 'treatment.added',
    APPOINTMENT_SCHEDULED = 'appointment.scheduled',
    APPOINTMENT_RESCHEDULED = 'appointment.rescheduled',
    APPOINTMENT_CANCELLED = 'appointment.cancelled',
    MEDICATION_REMINDER = 'medication.reminder',
    TEST_RESULTS_READY = 'test.results.ready',
    EMERGENCY_ALERT = 'emergency.alert',
    INVENTORY_LOW = 'inventory.low',
  }
  
  @Injectable()
  export class EventsService {
    private logger = new Logger('EventsService');
  
    constructor(private eventEmitter: EventEmitter2) {}
  
    // Emit a vaccination due event
    emitVaccinationDue(data: {
      petId: string;
      petName: string;
      ownerId: string;
      vaccinationType: string;
      dueDate: Date;
    }) {
      this.logger.log(`Emitting vaccination due event for pet ${data.petId}`);
      this.eventEmitter.emit(PetClinicEventType.VACCINATION_DUE, data);
    }
  
    // Emit a new treatment event
    emitTreatmentAdded(data: {
      petId: string;
      petName: string;
      ownerId: string;
      treatmentName: string;
      vetId: string;
    }) {
      this.logger.log(`Emitting treatment added event for pet ${data.petId}`);
      this.eventEmitter.emit(PetClinicEventType.TREATMENT_ADDED, data);
    }
  
    // Emit an appointment rescheduled event
    emitAppointmentRescheduled(data: {
      appointmentId: string;
      ownerId: string;
      vetId: string;
      petName: string;
      oldDateTime: Date;
      newDateTime: Date;
    }) {
      this.logger.log(
        `Emitting appointment rescheduled event for appointment ${data.appointmentId}`,
      );
      this.eventEmitter.emit(PetClinicEventType.APPOINTMENT_RESCHEDULED, data);
    }
  
    // Emit a medication reminder event
    emitMedicationReminder(data: {
      petId: string;
      petName: string;
      ownerId: string;
      medicationName: string;
      dosage: string;
      reminderTime: Date;
      instructions?: string;
    }) {
      this.logger.log(`Emitting medication reminder for pet ${data.petId}`);
      this.eventEmitter.emit(PetClinicEventType.MEDICATION_REMINDER, data);
    }
  
    // Emit test results ready event
    emitTestResultsReady(data: {
      testId: string;
      petId: string;
      petName: string;
      ownerId: string;
      vetId: string;
      testType: string;
      resultSummary: string;
      resultDate: Date;
    }) {
      this.logger.log(`Emitting test results ready for test ${data.testId}`);
      this.eventEmitter.emit(PetClinicEventType.TEST_RESULTS_READY, data);
    }
  
    // Emit emergency alert event
    emitEmergencyAlert(data: {
      clinicId: string;
      alertType: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedRoles: ('owner' | 'vet' | 'admin')[];
    }) {
      this.logger.log(`Emitting emergency alert: ${data.alertType}`);
      this.eventEmitter.emit(PetClinicEventType.EMERGENCY_ALERT, data);
    }
  
    // Emit inventory low event
    emitInventoryLow(data: {
      itemId: string;
      itemName: string;
      currentStock: number;
      minThreshold: number;
      urgent: boolean;
    }) {
      this.logger.log(`Emitting inventory low alert for ${data.itemName}`);
      this.eventEmitter.emit(PetClinicEventType.INVENTORY_LOW, data);
    }
  }
  
  // FILE: src/realTimeNotification/events.module.ts
  import { Module } from '@nestjs/common';
  import { EventEmitterModule } from '@nestjs/event-emitter';
  import { EventsService } from './events.service';
  
  @Module({
    imports: [
      EventEmitterModule.forRoot({
        // Global configuration for event emitter
        wildcard: true,
        delimiter: '.',
        newListener: false,
        removeListener: false,
        maxListeners: 10,
        verboseMemoryLeak: false,
        ignoreErrors: false,
      }),
    ],
    providers: [EventsService],
    exports: [EventsService],
  })
  export class EventsModule {}
  
  // FILE: src/realTimeNotification/notification.listeners.ts
  import { Injectable, Logger } from '@nestjs/common';
  import { OnEvent } from '@nestjs/event-emitter';
  import { NotificationsService } from './notifications.service';
  import { PetClinicEventType } from '../events/events.service';
  
  @Injectable()
  export class NotificationListeners {
    private logger = new Logger('NotificationListeners');
  
    constructor(private notificationsService: NotificationsService) {}
  
    @OnEvent(PetClinicEventType.VACCINATION_DUE)
    async handleVaccinationDueEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      vaccinationType: string;
      dueDate: Date;
    }) {
      this.logger.log(
        `Handling vaccination due event for pet ${payload.petId}`,
      );
      await this.notificationsService.sendVaccinationDueNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.vaccinationType,
        payload.dueDate,
      );
    }
  
    @OnEvent(PetClinicEventType.TREATMENT_ADDED)
    async handleTreatmentAddedEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      treatmentName: string;
      vetId: string;
    }) {
      this.logger.log(
        `Handling treatment added event for pet ${payload.petId}`,
      );
      await this.notificationsService.sendNewTreatmentNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.treatmentName,
        payload.vetId,
      );
    }
  
    @OnEvent(PetClinicEventType.APPOINTMENT_RESCHEDULED)
    async handleAppointmentRescheduledEvent(payload: {
      appointmentId: string;
      ownerId: string;
      vetId: string;
      petName: string;
      oldDateTime: Date;
      newDateTime: Date;
    }) {
      this.logger.log(
        `Handling appointment rescheduled event for appointment ${payload.appointmentId}`,
      );
      await this.notificationsService.sendAppointmentRescheduledNotification(
        payload.appointmentId,
        payload.ownerId,
        payload.vetId,
        payload.petName,
        payload.oldDateTime,
        payload.newDateTime,
      );
    }
  
    @OnEvent(PetClinicEventType.MEDICATION_REMINDER)
    async handleMedicationReminderEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      medicationName: string;
      dosage: string;
      reminderTime: Date;
      instructions?: string;
    }) {
      this.logger.log(`Handling medication reminder event for pet ${payload.petId}`);
      await this.notificationsService.sendMedicationReminderNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.medicationName,
        payload.dosage,
        payload.reminderTime,
        payload.instructions,
      );
    }
  
    @OnEvent(PetClinicEventType.TEST_RESULTS_READY)
    async handleTestResultsReadyEvent(payload: {
      testId: string;
      petId: string;
      petName: string;
      ownerId: string;
      vetId: string;
      testType: string;
      resultSummary: string;
      resultDate: Date;
    }) {
      this.logger.log(`Handling test results ready event for test ${payload.testId}`);
      await this.notificationsService.sendTestResultsReadyNotification(
        payload.testId,
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.vetId,
        payload.testType,
        payload.resultSummary,
        payload.resultDate,
      );
    }
  
    @OnEvent(PetClinicEventType.EMERGENCY_ALERT)
    async handleEmergencyAlertEvent(payload: {
      clinicId: string;
      alertType: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedRoles: ('owner' | 'vet' | 'admin')[];
    }) {
      this.logger.log(`Handling emergency alert event: ${payload.alertType}`);
      await this.notificationsService.sendEmergencyAlertNotification(
        payload.clinicId,
        payload.alertType,
        payload.message,
        payload.severity,
        payload.affectedRoles,
      );
    }
  
    @OnEvent(PetClinicEventType.INVENTORY_LOW)
    async handleInventoryLowEvent(payload: {
      itemId: string;
      itemName: string;
      currentStock: number;
      minThreshold: number;
      urgent: boolean;
    }) {
      this.logger.log(`Handling inventory low event for ${payload.itemName}`);
      await this.notificationsService.sendInventoryLowNotification(
        payload.itemId,
        payload.itemName,
        payload.currentStock,
        payload.minThreshold,
        payload.urgent,
      );
    }
  }
  
  // FILE: src/realTimeNotification/app.module.ts
  import { Module } from '@nestjs/common';
  import { EventsModule } from './events/events.module';
  import { NotificationsModule } from './notifications/notifications.module';
  import { NotificationListeners } from './notifications/notification.listeners';
  
  @Module({
    imports: [
      EventsModule,
      NotificationsModule,
      // Other modules...
    ],
    providers: [NotificationListeners],
  })
  export class AppModule {}
  
  // FILE: src/main.ts
  import { NestFactory } from '@nestjs/core';
  import { AppModule } from './app.module';
  import { Logger } from '@nestjs/common';
  
  async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: '*', // In production, specify your client domains
      methods: ['GET', 'POST'],
      credentials: true,
    });
    
    await app.listen(3000);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  }
  bootstrap();
  
  // EXAMPLE: Usage in a service that triggers events
  // FILE: src/realTimeNotification/appointments/appointments.service.ts (partial)
  import { Injectable } from '@nestjs/common';
  import { EventsService } from '../events/events.service';
  
  @Injectable()
  export class AppointmentsService {
    constructor(private eventsService: EventsService) {}
  
    async rescheduleAppointment(
      appointmentId: string,
      newDateTime: Date,
      // Other parameters...
    ) {
      // Business logic to update appointment in database
      // ...
      
      // Get appointment details (assume these are fetched from DB)
      const appointment = {
        id: appointmentId,
        ownerId: 'owner-123',
        vetId: 'vet-456',
        petId: 'pet-789',
        petName: 'Max',
        oldDateTime: new Date('2025-05-15T14:00:00'),
        newDateTime: newDateTime,
      };
      
      // Emit event for notification system
      this.eventsService.emitAppointmentRescheduled({
        appointmentId,
        ownerId: appointment.ownerId,
        vetId: appointment.vetId,
        petName: appointment.petName,
        oldDateTime: appointment.oldDateTime,
        newDateTime: appointment.newDateTime,
      });
      
      return {
        // Return updated appointment...
      };
    }
  }
  
  // FILE: realTimeNotification/client/websocket-client.js
  // Example client-side code for connecting to WebSocket
  const socket = io('http://localhost:3000');
  
  // Register user after authentication
  function registerUser(userId, userType) {
    socket.emit('register', { userId, userType });
  }
  
  // Listen for notifications
  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);
    
    // Handle different notification types
    switch (notification.type) {
      case 'vaccination_due':
        showVaccinationAlert(notification);
        break;
      case 'new_treatment':
        showTreatmentNotification(notification);
        break;
      case 'appointment_rescheduled':
        showAppointmentUpdate(notification);
        break;
      // Add more handlers for other notification types
    }
  });
  
  // Example handler functions
  function showVaccinationAlert(notification) {
    // Show a prominent alert for vaccination due
    // Example: Display a toast notification
  }
  
  function showTreatmentNotification(notification) {
    // Show treatment notification
    // Example: Update UI with new treatment information
  }
  
  function showAppointmentUpdate(notification) {
    // Show appointment update
    // Example: Update calendar and show a notification
  }
  
  // Connection status handlers
  socket.on('connect', () => {
    console.log('Connected to notification service');
    
    // Re-register user if we have user info in local storage
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    
    if (userId && userType) {
      registerUser(userId, userType);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from notification service');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });