// Mirrors supabase/migrations. Regenerate with:
//   npx supabase gen types typescript --project-id <ref> > types/database.ts
export type Database = {
  public: {
    Tables: {
      wallpapers: {
        Row: {
          id: string;
          title: string;
          slug: string;
          file_url: string;
          width: number;
          height: number;
          featured: boolean;
          description: string | null;
          collections: string[];
          downloads: number;
          blur_data_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          file_url: string;
          width: number;
          height: number;
          featured?: boolean;
          description?: string | null;
          collections?: string[];
          downloads?: number;
          blur_data_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wallpapers"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: { slug: string; name: string; blurb: string | null; position: number; created_at: string };
        Insert: { slug: string; name: string; blurb?: string | null; position?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      admins: {
        Row: { user_id: string };
        Insert: { user_id: string };
        Update: { user_id?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      count_download: { Args: { p_slug: string }; Returns: undefined };
      detach_category: { Args: { p_slug: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Wallpaper = Database["public"]["Tables"]["wallpapers"]["Row"];
