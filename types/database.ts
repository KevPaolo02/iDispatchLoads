export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          current_location: string;
          preferred_routes: Json | null;
          trailer_type: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          current_location: string;
          preferred_routes?: Json | null;
          trailer_type: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          current_location?: string;
          preferred_routes?: Json | null;
          trailer_type?: string;
          is_available?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      loads: {
        Row: {
          id: string;
          pickup_city: string;
          pickup_state: string;
          delivery_city: string;
          delivery_state: string;
          vehicle_type: string;
          price: number;
          distance_miles: number | null;
          pickup_date: string;
          notes: string | null;
          status: "NEW" | "OFFERED" | "ASSIGNED" | "COMPLETED";
          driver_id: string | null;
          agreed_price: number | null;
          driver_status: "assigned" | "en_route" | "picked_up" | "delivered" | null;
          external_source: "manual" | "super_dispatch" | "central_dispatch";
          external_id: string | null;
          external_url: string | null;
          external_payload: Json | null;
          external_synced_at: string | null;
          broker_id: string | null;
          dealer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pickup_city: string;
          pickup_state: string;
          delivery_city: string;
          delivery_state: string;
          vehicle_type: string;
          price: number;
          distance_miles?: number | null;
          pickup_date: string;
          notes?: string | null;
          status?: "NEW" | "OFFERED" | "ASSIGNED" | "COMPLETED";
          driver_id?: string | null;
          agreed_price?: number | null;
          driver_status?: "assigned" | "en_route" | "picked_up" | "delivered" | null;
          external_source?: "manual" | "super_dispatch" | "central_dispatch";
          external_id?: string | null;
          external_url?: string | null;
          external_payload?: Json | null;
          external_synced_at?: string | null;
          broker_id?: string | null;
          dealer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pickup_city?: string;
          pickup_state?: string;
          delivery_city?: string;
          delivery_state?: string;
          vehicle_type?: string;
          price?: number;
          distance_miles?: number | null;
          pickup_date?: string;
          notes?: string | null;
          status?: "NEW" | "OFFERED" | "ASSIGNED" | "COMPLETED";
          driver_id?: string | null;
          agreed_price?: number | null;
          driver_status?: "assigned" | "en_route" | "picked_up" | "delivered" | null;
          external_source?: "manual" | "super_dispatch" | "central_dispatch";
          external_id?: string | null;
          external_url?: string | null;
          external_payload?: Json | null;
          external_synced_at?: string | null;
          broker_id?: string | null;
          dealer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loads_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          type: "broker" | "dealer" | "shipper";
          phone: string | null;
          avg_wait_minutes: number | null;
          payment_speed: "fast" | "normal" | "slow" | "never" | null;
          notes: string | null;
          tags: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "broker" | "dealer" | "shipper";
          phone?: string | null;
          avg_wait_minutes?: number | null;
          payment_speed?: "fast" | "normal" | "slow" | "never" | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "broker" | "dealer" | "shipper";
          phone?: string | null;
          avg_wait_minutes?: number | null;
          payment_speed?: "fast" | "normal" | "slow" | "never" | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      load_photos: {
        Row: {
          id: string;
          load_id: string;
          driver_id: string | null;
          stage: "pickup" | "delivery";
          storage_path: string;
          created_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          load_id: string;
          driver_id?: string | null;
          stage: "pickup" | "delivery";
          storage_path: string;
          created_by?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          load_id?: string;
          driver_id?: string | null;
          stage?: "pickup" | "delivery";
          storage_path?: string;
          created_by?: string | null;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "load_photos_load_id_fkey";
            columns: ["load_id"];
            isOneToOne: false;
            referencedRelation: "loads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "load_photos_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
        ];
      };
      offers: {
        Row: {
          id: string;
          load_id: string;
          driver_id: string;
          status: "pending" | "accepted" | "rejected";
          offered_price: number | null;
          message_body: string;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          load_id: string;
          driver_id: string;
          status?: "pending" | "accepted" | "rejected";
          offered_price?: number | null;
          message_body: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          load_id?: string;
          driver_id?: string;
          status?: "pending" | "accepted" | "rejected";
          offered_price?: number | null;
          message_body?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offers_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_load_id_fkey";
            columns: ["load_id"];
            isOneToOne: false;
            referencedRelation: "loads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_offer: {
        Args: {
          p_offer_id: string;
          p_agreed_price?: number | null;
        };
        Returns: Json;
      };
      send_offer: {
        Args: {
          p_load_id: string;
          p_driver_id: string;
          p_offered_price: number;
          p_message_body: string;
        };
        Returns: Json;
      };
      assign_load: {
        Args: {
          p_load_id: string;
          p_driver_id: string;
          p_agreed_price?: number | null;
          p_message_body?: string | null;
        };
        Returns: Json;
      };
      unassign_load: {
        Args: {
          p_load_id: string;
        };
        Returns: Json;
      };
      set_driver_progress: {
        Args: {
          p_load_id: string;
          p_driver_status: "assigned" | "en_route" | "picked_up" | "delivered";
        };
        Returns: Json;
      };
    };
    Enums: {
      load_status: "NEW" | "OFFERED" | "ASSIGNED" | "COMPLETED";
      offer_status: "pending" | "accepted" | "rejected";
      driver_progress_status: "assigned" | "en_route" | "picked_up" | "delivered";
    };
    CompositeTypes: Record<string, never>;
  };
};
