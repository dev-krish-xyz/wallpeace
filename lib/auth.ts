import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Resolves the signed-in user and whether they are in public.admins. */
export async function getSession() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false } as const;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: Boolean(isAdmin) } as const;
}

/** Every admin mutation calls this; middleware alone is never trusted. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session.user || !session.isAdmin) throw new Error("Not authorized");
  return session;
}
