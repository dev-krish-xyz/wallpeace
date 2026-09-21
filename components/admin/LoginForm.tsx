"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(initialError);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(undefined);
    const { error } = await createSupabaseBrowser().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/auth/callback?next=/admin` },
    });
    if (error) {
      setError(error.message);
      setState("idle");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <p className="mt-7 rounded-[9px] bg-fill px-4 py-3 text-[13px] leading-relaxed text-label-2">
        Check <span className="font-medium text-label">{email}</span> for a sign-in link.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-3 text-left">
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 w-full rounded-[8px] bg-fill px-3 text-[13px] text-label outline-none ring-[0.5px] ring-separator placeholder:text-label-3 focus:ring-[3.5px] focus:ring-accent/50"
      />
      {error && <p className="px-1 text-[12px] text-danger">{error}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Continue with Email"}
      </Button>
    </form>
  );
}
