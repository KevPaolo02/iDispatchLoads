import type { LeadStatus } from "@/lib/types/entities";

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
  created_at: string;
  updated_at: string;
};

export type LeadInsertRow = Omit<LeadRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
