import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/types/database";

export const createSupabaseBrowser = () => createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY);
