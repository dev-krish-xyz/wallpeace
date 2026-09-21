"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type LoginState = { error?: string; username?: string };

/**
 * Username/password sign-in. The username is an alias for the Supabase account
 * in ADMIN_EMAIL, so the session is a normal Supabase session and RLS still applies.
 */
export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const adminUsername = (process.env.ADMIN_USERNAME ?? "admin").toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) return { error: "Sign-in isn't configured (ADMIN_EMAIL missing).", username };
  if (!username || !password) return { error: "Enter your username and password.", username };

  // Same message for a wrong username or password.
  const invalid = { error: "Incorrect username or password.", username };
  if (username !== adminUsername) return invalid;

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
  if (error) {
    if (error.status === 429) return { error: "Too many attempts. Try again in a few minutes.", username };
    return invalid;
  }

  redirect("/admin");
}
