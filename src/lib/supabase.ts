import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          business_name: string | null;
          plan: "free" | "pro" | "business" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          theme_color: string;
          secondary_color: string;
          logo_url: string | null;
          background_url: string | null;
          frame_template_id: string;
          layout_mode: "single" | "strip-3" | "strip-4" | "grid-4" | "grid-6";
          active_from: string;
          active_until: string;
          status: "draft" | "active" | "paused" | "ended";
          max_photos: number;
          allow_download: boolean;
          allow_share: boolean;
          show_gallery: boolean;
          watermark_enabled: boolean;
          watermark_text: string | null;
          custom_message: string | null;
          redirect_url: string | null;
          password: string | null;
          photo_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "created_at" | "updated_at" | "photo_count" | "view_count">;
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          original_url: string;
          framed_url: string;
          thumbnail_url: string | null;
          frame_template_id: string;
          layout_mode: string;
          guest_name: string | null;
          guest_message: string | null;
          filter_applied: string | null;
          stickers_data: Record<string, unknown>[] | null;
          is_approved: boolean;
          is_featured: boolean;
          download_count: number;
          share_count: number;
          device_info: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["photos"]["Row"], "created_at" | "download_count" | "share_count">;
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
      };
      analytics: {
        Row: {
          id: string;
          event_id: string;
          action: string;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics"]["Insert"]>;
      };
    };
  };
};
