export const userRoles = ["admin", "dispatcher", "support"] as const;
export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "onboarded",
  "lost",
] as const;
export const partyStatuses = ["prospect", "active", "inactive"] as const;
export const loadStatuses = [
  "available",
  "booked",
  "in_transit",
  "delivered",
  "cancelled",
] as const;
export const documentStatuses = [
  "pending",
  "received",
  "verified",
  "expired",
] as const;
export const taskStatuses = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export const communicationChannels = ["call", "sms", "email"] as const;
export const communicationDirections = ["inbound", "outbound"] as const;
export const relatedEntityTypes = [
  "lead",
  "driver",
  "carrier",
  "truck",
  "broker",
  "load",
  "document",
  "task",
] as const;

export type UserRole = (typeof userRoles)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type PartyStatus = (typeof partyStatuses)[number];
export type LoadStatus = (typeof loadStatuses)[number];
export type DocumentStatus = (typeof documentStatuses)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type CommunicationChannel = (typeof communicationChannels)[number];
export type CommunicationDirection = (typeof communicationDirections)[number];
export type RelatedEntityType = (typeof relatedEntityTypes)[number];

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface Role {
  code: UserRole;
  label: string;
  description: string;
}

export interface Lead extends BaseEntity {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  truckType: string;
  preferredLanes: string;
  notes: string | null;
  status: LeadStatus;
  source: string;
  campaign: string | null;
}

export interface Carrier extends BaseEntity {
  sourceLeadId: string | null;
  companyName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  mcNumber: string | null;
  dotNumber: string | null;
  status: PartyStatus;
  notes: string | null;
}

export interface Driver extends BaseEntity {
  sourceLeadId: string | null;
  carrierId: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  truckType: string | null;
  preferredLanes: string | null;
  status: PartyStatus;
  notes: string | null;
}

export interface Truck extends BaseEntity {
  carrierId: string | null;
  driverId: string | null;
  truckType: string;
  unitNumber: string | null;
  equipmentType: string | null;
  status: PartyStatus;
}

export interface Broker extends BaseEntity {
  companyName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: PartyStatus;
}

export interface Load extends BaseEntity {
  brokerId: string | null;
  carrierId: string | null;
  driverId: string | null;
  truckId: string | null;
  origin: string;
  destination: string;
  rate: number | null;
  status: LoadStatus;
  notes: string | null;
}

export interface Document extends BaseEntity {
  entityType: RelatedEntityType;
  entityId: string;
  documentType: string;
  status: DocumentStatus;
  storagePath: string;
  expiresAt: string | null;
}

export interface Task extends BaseEntity {
  entityType: RelatedEntityType;
  entityId: string;
  title: string;
  details: string | null;
  assignedUserId: string | null;
  dueAt: string | null;
  status: TaskStatus;
}

export interface Communication extends BaseEntity {
  entityType: RelatedEntityType;
  entityId: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string | null;
  summary: string;
  authorUserId: string | null;
}

export interface Note extends BaseEntity {
  entityType: RelatedEntityType;
  entityId: string;
  authorUserId: string | null;
  body: string;
}
