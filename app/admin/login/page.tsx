import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign In", robots: { index: false } };

export default async function LoginPage() {
  if (isSupabaseConfigured) {
    const { user } = await getSession();
    if (user) redirect("/admin");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-grouped px-5">
      <div className="w-full max-w-[340px] rounded-[14px] bg-surface p-8 text-center shadow-card animate-appear">
        <Image
          src="/logo.webp"
          alt=""
          width={64}
          height={64}
          priority
          unoptimized
          className="mx-auto drop-shadow-[0_2px_5px_rgb(0_0_0/0.18)]"
        />
        <h1 className="mt-5 text-[17px] font-semibold tracking-[-0.01em]">Sign in to Wallpeace</h1>
        <p className="mt-1 text-[13px] text-label-2">Library administration</p>
        <LoginForm />
      </div>
    </main>
  );
}
