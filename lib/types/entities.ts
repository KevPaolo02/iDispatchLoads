export const userRoles = ["admin", "dispatcher", "support"] as const;
export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "onboarded",
  "lost",
] as const;
export const v1LeadStatuses = [
  "new",
  "contacted",
  "qualified",
  "lost",
] as const;
export const driverStatuses = [
  "available",
  "assigned",
  "in_transit",
] as const;
export const dispatchLoadStatuses = [
  "posted",
  "negotiating",
  "booked",
  "assigned",
  "pickup_scheduled",
  "picked_up",
  "in_transit",
  "delivered",
  "closed",
  "problem_hold",
] as const;
export const loadOpportunityStatuses = [
  "new",
  "needs_review",
  "needs_quote",
  "awaiting_customer",
  "ready_to_post",
  "closed_won",
  "closed_lost",
  "on_hold",
] as const;
export const loadVehicleOperabilityStatuses = [
  "operable",
  "inop",
] as const;
export const activityEntityTypes = [
  "load",
  "load_opportunity",
] as const;
export const activityActionTypes = [
  "status_changed",
  "notes_saved",
  "pricing_updated",
  "assignment_updated",
  "schedule_updated",
  "problem_flag_created",
  "problem_flag_resolved",
  "details_updated",
  "vehicle_added",
  "vehicle_updated",
  "vehicle_removed",
  "record_created",
] as const;
export const problemFlagTypes = [
  "late_pickup",
  "late_delivery",
  "no_carrier_response",
  "no_customer_response",
  "pricing_issue",
  "damage_issue",
  "missing_docs",
  "reschedule_needed",
] as const;
export const problemPriorityLevels = ["low", "medium", "high"] as const;
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
  "load_opportunity",
  "document",
  "task",
] as const;

export type UserRole = (typeof userRoles)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type V1LeadStatus = (typeof v1LeadStatuses)[number];
export type DriverStatus = (typeof driverStatuses)[number];
export type DispatchLoadStatus = (typeof dispatchLoadStatuses)[number];
export type LoadOpportunityStatus = (typeof loadOpportunityStatuses)[number];
export type LoadVehicleOperabilityStatus =
  (typeof loadVehicleOperabilityStatuses)[number];
export type ActivityEntityType = (typeof activityEntityTypes)[number];
export type ActivityActionType = (typeof activityActionTypes)[number];
export type ProblemFlagType = (typeof problemFlagTypes)[number];
export type ProblemPriorityLevel = (typeof problemPriorityLevels)[number];
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
  lastContactedAt: string | null;
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
  assignedDispatcherEmail: string | null;
  company: string;
  driverName: string;
  phone: string;
  truckType: string;
  truckUnitNumber: string | null;
  truckVin: string | null;
  trailerUnitNumber: string | null;
  trailerVin: string | null;
  preferredLanes: string | null;
  homeBase: string;
  currentLocation: string | null;
  availableFrom: string | null;
  capacity: number | null;
  status: DriverStatus;
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
  driverId: string | null;
  sourceLeadId: string | null;
  sourceOpportunityId: string | null;
  company: string;
  origin: string;
  destination: string;
  pickupCity: string | null;
  pickupState: string | null;
  pickupZip: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  trailerType: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  broker: string;
  customerPrice: number | null;
  carrierPay: number | null;
  depositCollected: boolean;
  codAmount: number | null;
  referenceNumber: string | null;
  contactName: string | null;
  contactPhone: string | null;
  pickupContactName: string | null;
  pickupContactPhone: string | null;
  deliveryContactName: string | null;
  deliveryContactPhone: string | null;
  carrierCompany: string | null;
  carrierMcNumber: string | null;
  carrierDispatcherName: string | null;
  carrierDispatcherPhone: string | null;
  carrierDriverName: string | null;
  carrierDriverPhone: string | null;
  truckTrailerType: string | null;
  rate: number | null;
  status: DispatchLoadStatus;
  notes: string | null;
}

export interface LoadOpportunity extends BaseEntity {
  source: string;
  sourceUrl: string | null;
  sourceReference: string | null;
  company: string | null;
  origin: string;
  destination: string;
  pickupCity: string | null;
  pickupState: string | null;
  pickupZip: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  trailerType: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  firstAvailableDate: string | null;
  pickupWindow: string | null;
  deliveryWindow: string | null;
  vehiclesCount: number;
  customerPrice: number | null;
  carrierPay: number | null;
  rate: number | null;
  contactName: string | null;
  contactPhone: string | null;
  status: LoadOpportunityStatus;
  assignedDriverId: string | null;
  notes: string | null;
}

export interface LoadVehicle extends BaseEntity {
  loadId: string;
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface LoadOpportunityVehicle extends BaseEntity {
  opportunityId: string;
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface ActivityEvent extends BaseEntity {
  entityType: ActivityEntityType;
  entityId: string;
  actionType: ActivityActionType;
  actorEmail: string;
  actorRole: UserRole;
  noteBody: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

export interface ProblemFlag extends BaseEntity {
  entityType: ActivityEntityType;
  entityId: string;
  flagType: ProblemFlagType;
  priority: ProblemPriorityLevel;
  noteBody: string;
  resolvedAt: string | null;
  resolvedByEmail: string | null;
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
