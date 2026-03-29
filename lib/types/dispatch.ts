import type {
  DispatchLoadStatus,
  DriverStatus,
  Lead,
  Load,
  Driver,
} from "@/lib/types/entities";

export interface DriverCreateInput {
  sourceLeadId: string | null;
  company: string;
  driverName: string;
  phone: string;
  truckType: string;
  preferredLanes: string | null;
  homeBase: string;
  status: DriverStatus;
  notes: string | null;
}

export interface LoadCreateInput {
  driverId: string | null;
  sourceLeadId: string | null;
  company: string;
  origin: string;
  destination: string;
  pickupDate: string | null;
  deliveryDate: string | null;
  broker: string;
  rate: number | null;
  status: DispatchLoadStatus;
  notes: string | null;
}

export interface DriverStatusUpdateInput {
  driverId: Driver["id"];
  status: DriverStatus;
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

export interface LoadAssignmentInput {
  loadId: Load["id"];
  driverId: Driver["id"] | null;
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
