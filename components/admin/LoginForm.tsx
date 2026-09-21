"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";

const field =
  "h-9 w-full bg-transparent px-3 text-[13px] text-label outline-none placeholder:text-label-3 focus:bg-surface";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-7 space-y-3 text-left">
      {/* Grouped fields, as in the macOS login window */}
      <div className="overflow-hidden rounded-[8px] bg-fill ring-[0.5px] ring-separator focus-within:ring-[3.5px] focus-within:ring-accent/50">
        <input
          name="username"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Username"
          defaultValue={state.username}
          className={field}
        />
        <div className="mx-3 h-px bg-separator" />
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className={field}
        />
      </div>
      {state.error && (
        <p role="alert" className="px-1 text-[12px] text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Signing In…" : "Sign In"}
      </Button>
    </form>
  );
}
