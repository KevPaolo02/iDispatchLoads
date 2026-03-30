import type {
  ActivityActionType,
  ActivityEntityType,
  DispatchLoadStatus,
  DriverStatus,
  LeadStatus,
  LoadOpportunityStatus,
  LoadVehicleOperabilityStatus,
  ProblemFlagType,
  ProblemPriorityLevel,
  UserRole,
} from "@/lib/types/entities";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type LeadRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  truck_type: string;
  preferred_lanes: string;
  notes: string | null;
  status: LeadStatus;
  source: string;
  campaign: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadInsertRow = Omit<
  LeadRow,
  "id" | "created_at" | "updated_at" | "last_contacted_at"
> & {
  id?: string;
  last_contacted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DriverRow = {
  id: string;
  source_lead_id: string | null;
  assigned_dispatcher_email: string | null;
  company: string;
  driver_name: string;
  phone: string;
  truck_type: string;
  truck_unit_number: string | null;
  truck_vin: string | null;
  trailer_unit_number: string | null;
  trailer_vin: string | null;
  preferred_lanes: string | null;
  home_base: string;
  current_location: string | null;
  available_from: string | null;
  capacity: number | null;
  status: DriverStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DriverInsertRow = Omit<
  DriverRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "source_lead_id"
  | "assigned_dispatcher_email"
  | "truck_unit_number"
  | "truck_vin"
  | "trailer_unit_number"
  | "trailer_vin"
  | "preferred_lanes"
  | "current_location"
  | "available_from"
  | "capacity"
> & {
  id?: string;
  source_lead_id?: string | null;
  assigned_dispatcher_email?: string | null;
  truck_unit_number?: string | null;
  truck_vin?: string | null;
  trailer_unit_number?: string | null;
  trailer_vin?: string | null;
  preferred_lanes?: string | null;
  current_location?: string | null;
  available_from?: string | null;
  capacity?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type LoadRow = {
  id: string;
  driver_id: string | null;
  source_lead_id: string | null;
  source_opportunity_id: string | null;
  company: string;
  origin: string;
  destination: string;
  pickup_city: string | null;
  pickup_state: string | null;
  pickup_zip: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_zip: string | null;
  trailer_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  broker: string;
  customer_price: number | null;
  carrier_pay: number | null;
  deposit_collected: boolean;
  cod_amount: number | null;
  reference_number: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  delivery_contact_name: string | null;
  delivery_contact_phone: string | null;
  carrier_company: string | null;
  carrier_mc_number: string | null;
  carrier_dispatcher_name: string | null;
  carrier_dispatcher_phone: string | null;
  carrier_driver_name: string | null;
  carrier_driver_phone: string | null;
  truck_trailer_type: string | null;
  rate: number | null;
  status: DispatchLoadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LoadInsertRow = Omit<
  LoadRow,
  "id" | "created_at" | "updated_at" | "source_lead_id" | "source_opportunity_id"
> & {
  id?: string;
  source_lead_id?: string | null;
  source_opportunity_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LoadOpportunityRow = {
  id: string;
  source: string;
  source_url: string | null;
  source_reference: string | null;
  company: string | null;
  origin: string;
  destination: string;
  pickup_city: string | null;
  pickup_state: string | null;
  pickup_zip: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_zip: string | null;
  trailer_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  first_available_date: string | null;
  pickup_window: string | null;
  delivery_window: string | null;
  vehicles_count: number;
  customer_price: number | null;
  carrier_pay: number | null;
  rate: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  status: LoadOpportunityStatus;
  assigned_driver_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LoadOpportunityInsertRow = Omit<
  LoadOpportunityRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "source_url"
  | "source_reference"
  | "company"
  | "pickup_city"
  | "pickup_state"
  | "pickup_zip"
  | "delivery_city"
  | "delivery_state"
  | "delivery_zip"
  | "trailer_type"
  | "customer_name"
  | "customer_phone"
  | "customer_email"
  | "first_available_date"
  | "pickup_window"
  | "delivery_window"
  | "customer_price"
  | "carrier_pay"
  | "rate"
  | "contact_name"
  | "contact_phone"
  | "assigned_driver_id"
  | "notes"
> & {
  id?: string;
  source_url?: string | null;
  source_reference?: string | null;
  company?: string | null;
  pickup_city?: string | null;
  pickup_state?: string | null;
  pickup_zip?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_zip?: string | null;
  trailer_type?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  first_available_date?: string | null;
  pickup_window?: string | null;
  delivery_window?: string | null;
  customer_price?: number | null;
  carrier_pay?: number | null;
  rate?: number | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  assigned_driver_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LoadVehicleRow = {
  id: string;
  load_id: string;
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lot_number: string | null;
  operability: LoadVehicleOperabilityStatus;
  created_at: string;
  updated_at: string;
};

export type LoadVehicleInsertRow = Omit<
  LoadVehicleRow,
  "id" | "created_at" | "updated_at" | "year" | "vin" | "lot_number"
> & {
  id?: string;
  year?: number | null;
  vin?: string | null;
  lot_number?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LoadOpportunityVehicleRow = {
  id: string;
  opportunity_id: string;
  year: number | null;
  make: string;
  model: string;
  vin: string | null;
  lot_number: string | null;
  operability: LoadVehicleOperabilityStatus;
  created_at: string;
  updated_at: string;
};

export type LoadOpportunityVehicleInsertRow = Omit<
  LoadOpportunityVehicleRow,
  "id" | "created_at" | "updated_at" | "year" | "vin" | "lot_number"
> & {
  id?: string;
  year?: number | null;
  vin?: string | null;
  lot_number?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ActivityEventRow = {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  action_type: ActivityActionType;
  actor_email: string;
  actor_role: UserRole;
  note_body: string | null;
  old_value: JsonValue | null;
  new_value: JsonValue | null;
  created_at: string;
  updated_at: string;
};

export type ActivityEventInsertRow = Omit<
  ActivityEventRow,
  "id" | "created_at" | "updated_at" | "note_body" | "old_value" | "new_value"
> & {
  id?: string;
  note_body?: string | null;
  old_value?: JsonValue | null;
  new_value?: JsonValue | null;
  created_at?: string;
  updated_at?: string;
};

export type ProblemFlagRow = {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  flag_type: ProblemFlagType;
  priority: ProblemPriorityLevel;
  note_body: string;
  resolved_at: string | null;
  resolved_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type ProblemFlagInsertRow = Omit<
  ProblemFlagRow,
  "id" | "created_at" | "updated_at" | "resolved_at" | "resolved_by_email"
> & {
  id?: string;
  resolved_at?: string | null;
  resolved_by_email?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsertRow;
        Update: Partial<LeadInsertRow>;
        Relationships: [];
      };
      drivers: {
        Row: DriverRow;
        Insert: DriverInsertRow;
        Update: Partial<DriverInsertRow>;
        Relationships: [];
      };
      loads: {
        Row: LoadRow;
        Insert: LoadInsertRow;
        Update: Partial<LoadInsertRow>;
        Relationships: [];
      };
      load_opportunities: {
        Row: LoadOpportunityRow;
        Insert: LoadOpportunityInsertRow;
        Update: Partial<LoadOpportunityInsertRow>;
        Relationships: [];
      };
      load_vehicles: {
        Row: LoadVehicleRow;
        Insert: LoadVehicleInsertRow;
        Update: Partial<LoadVehicleInsertRow>;
        Relationships: [];
      };
      load_opportunity_vehicles: {
        Row: LoadOpportunityVehicleRow;
        Insert: LoadOpportunityVehicleInsertRow;
        Update: Partial<LoadOpportunityVehicleInsertRow>;
        Relationships: [];
      };
      activity_events: {
        Row: ActivityEventRow;
        Insert: ActivityEventInsertRow;
        Update: Partial<ActivityEventInsertRow>;
        Relationships: [];
      };
      problem_flags: {
        Row: ProblemFlagRow;
        Insert: ProblemFlagInsertRow;
        Update: Partial<ProblemFlagInsertRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
