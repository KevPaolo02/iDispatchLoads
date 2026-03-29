import type {
  ActivityActionType,
  ActivityEntityType,
  DispatchLoadStatus,
  DriverStatus,
  Lead,
  LoadOpportunity,
  LoadOpportunityStatus,
  LoadOpportunityVehicle,
  LoadVehicle,
  LoadVehicleOperabilityStatus,
  Load,
  Driver,
  ProblemFlag,
  ProblemFlagType,
  ProblemPriorityLevel,
  UserRole,
} from "@/lib/types/entities";

export interface DriverCreateInput {
  sourceLeadId: string | null;
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

export interface LoadCreateInput {
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
  referenceNumber: string;
  contactName: string;
  contactPhone: string;
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
  rate: number;
  status: DispatchLoadStatus;
  notes: string | null;
}

export interface DriverStatusUpdateInput {
  driverId: Driver["id"];
  status: DriverStatus;
}

export interface DriverMovementUpdateInput {
  driverId: Driver["id"];
  truckUnitNumber: string | null;
  truckVin: string | null;
  trailerUnitNumber: string | null;
  trailerVin: string | null;
  currentLocation: string | null;
  availableFrom: string | null;
  capacity: number | null;
}

export interface DriverNotesUpdateInput {
  driverId: Driver["id"];
  notes: string | null;
}

export interface LoadStatusUpdateInput {
  loadId: Load["id"];
  status: DispatchLoadStatus;
}

export interface LoadNotesUpdateInput {
  loadId: Load["id"];
  notes: string | null;
}

export interface LoadOperationalUpdateInput {
  loadId: Load["id"];
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
  customerPrice: number | null;
  carrierPay: number | null;
  depositCollected: boolean;
  codAmount: number | null;
  referenceNumber: string;
  contactName: string;
  contactPhone: string;
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
}

export interface LoadAssignmentInput {
  loadId: Load["id"];
  driverId: Driver["id"] | null;
}

export interface LoadOpportunityCreateInput {
  source: string;
  sourceUrl: string | null;
  sourceReference: string;
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
  contactName: string;
  contactPhone: string;
  status: LoadOpportunityStatus;
  assignedDriverId: Driver["id"] | null;
  notes: string | null;
}

export interface LoadOpportunityOperationalUpdateInput {
  opportunityId: LoadOpportunity["id"];
  sourceReference: string;
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
  customerPrice: number | null;
  carrierPay: number | null;
  contactName: string;
  contactPhone: string;
}

export interface LoadOpportunityStatusUpdateInput {
  opportunityId: LoadOpportunity["id"];
  status: LoadOpportunityStatus;
}

export interface LoadOpportunityNotesUpdateInput {
  opportunityId: LoadOpportunity["id"];
  notes: string | null;
}

export interface LoadOpportunityAssignmentInput {
  opportunityId: LoadOpportunity["id"];
  driverId: Driver["id"] | null;
}

export interface LoadVehicleCreateInput {
  loadId: Load["id"];
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface LoadVehicleUpdateInput {
  loadVehicleId: LoadVehicle["id"];
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface LoadVehicleDeleteInput {
  loadVehicleId: LoadVehicle["id"];
}

export interface LoadOpportunityVehicleCreateInput {
  opportunityId: LoadOpportunity["id"];
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface LoadOpportunityVehicleUpdateInput {
  opportunityVehicleId: LoadOpportunityVehicle["id"];
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lotNumber: string | null;
  operability: LoadVehicleOperabilityStatus;
}

export interface LoadOpportunityVehicleDeleteInput {
  opportunityVehicleId: LoadOpportunityVehicle["id"];
}

export interface ActivityEventCreateInput {
  entityType: ActivityEntityType;
  entityId: string;
  actionType: ActivityActionType;
  actorEmail: string;
  actorRole: UserRole;
  noteBody: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

export interface ProblemFlagCreateInput {
  entityType: ActivityEntityType;
  entityId: string;
  flagType: ProblemFlagType;
  priority: ProblemPriorityLevel;
  noteBody: string;
}

export interface ProblemFlagResolveInput {
  problemFlagId: ProblemFlag["id"];
  resolvedByEmail: string;
}

export interface LeadActivityUpdateInput {
  leadId: string;
  status: Lead["status"];
  notes?: string | null;
  lastContactedAt?: string;
}

export interface LeadNotesUpdateInput {
  leadId: Lead["id"];
  notes: string | null;
}

export interface LeadToDriverConversionInput {
  leadId: Lead["id"];
  company: string;
  homeBase: string;
}
