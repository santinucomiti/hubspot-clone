export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum LifecycleStage {
  SUBSCRIBER = 'SUBSCRIBER',
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER',
}

export enum ActivityType {
  NOTE = 'NOTE',
  EMAIL = 'EMAIL',
  CALL = 'CALL',
  MEETING = 'MEETING',
  TASK = 'TASK',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketSource {
  EMAIL = 'EMAIL',
  MANUAL = 'MANUAL',
  FORM = 'FORM',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
}

export enum CampaignEventType {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export enum ContactListType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN',
}

export enum CustomFieldEntityType {
  CONTACT = 'CONTACT',
  COMPANY = 'COMPANY',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
