import type {
  DispatchLoadStatus,
  DriverStatus,
  LeadStatus,
} from "@/lib/types/entities";

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
  company: string;
  driver_name: string;
  phone: string;
  truck_type: string;
  preferred_lanes: string | null;
  home_base: string;
  status: DriverStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DriverInsertRow = Omit<
  DriverRow,
  "id" | "created_at" | "updated_at" | "source_lead_id" | "preferred_lanes"
> & {
  id?: string;
  source_lead_id?: string | null;
  preferred_lanes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LoadRow = {
  id: string;
  driver_id: string | null;
  source_lead_id: string | null;
  company: string;
  origin: string;
  destination: string;
  pickup_date: string | null;
  delivery_date: string | null;
  broker: string;
  rate: number | null;
  status: DispatchLoadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LoadInsertRow = Omit<
  LoadRow,
  "id" | "created_at" | "updated_at" | "source_lead_id"
> & {
  id?: string;
  source_lead_id?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
