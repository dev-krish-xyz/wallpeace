import { Photo } from "@/components/ui/icons";

export function EmptyLibrary({ configured }: { configured: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] bg-grouped px-6 py-28 text-center">
      <Photo width={40} height={40} strokeWidth={1.25} className="text-label-3" />
      <h2 className="mt-4 text-[17px] font-semibold text-label">No Wallpapers Yet</h2>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-label-2">
        {configured
          ? "New wallpapers will appear here as soon as they're published."
          : "Connect Supabase by setting NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."}
      </p>
    </div>
  );
}
