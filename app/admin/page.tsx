import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { Button } from "@/components/ui/Button";
import { UploadPanel } from "@/components/admin/UploadPanel";
import { LibraryList } from "@/components/admin/LibraryList";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { WALLPAPER_COLUMNS } from "@/lib/wallpapers";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";
// Image processing of large originals runs inside this page's server actions.
export const maxDuration = 60;

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24">
        <EmptyLibrary configured={false} />
      </main>
    );
  }

  const { supabase, user, isAdmin } = await getSession();
  if (!user) redirect("/admin/login");

  const signOutButton = (
    <form action={signOut}>
      <Button variant="plain" size="sm" type="submit">
        Sign Out
      </Button>
    </form>
  );

  if (!isAdmin) {
    return (
      <>
        <Toolbar left={<Brand suffix="Admin" />} right={signOutButton} />
        <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[17px] font-semibold">No Admin Access</h1>
          <p className="mt-1 max-w-sm text-[13px] text-label-2">
            {user.email} is signed in but isn&apos;t listed in <code className="text-label">public.admins</code>.
          </p>
        </main>
      </>
    );
  }

  const { data: wallpapers, error } = await supabase
    .from("wallpapers")
    .select(WALLPAPER_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <>
      <Toolbar
        left={<Brand suffix="Admin" />}
        right={
          <>
            <span className="hidden text-[12px] text-label-3 sm:inline">{user.email}</span>
            {signOutButton}
          </>
        }
      />
      <main className="mx-auto max-w-[960px] px-5 pb-32 sm:px-8">
        <header className="pt-14 pb-8">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">Library</h1>
          <p className="mt-1 text-[13px] text-label-2">
            {wallpapers.length} published · {wallpapers.filter((w) => w.featured).length} featured
          </p>
        </header>
        <div className="space-y-12">
          <section>
            <h2 className="mb-2 px-1 text-[13px] font-semibold text-label-2">Add Wallpapers</h2>
            <UploadPanel />
          </section>
          <section>
            <h2 className="mb-2 px-1 text-[13px] font-semibold text-label-2">Published</h2>
            <LibraryList wallpapers={wallpapers} />
          </section>
        </div>
      </main>
    </>
  );
}
