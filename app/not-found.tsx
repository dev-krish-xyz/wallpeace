import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Toolbar left={<Brand />} />
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Wallpaper Not Found</h1>
        <p className="mt-1.5 text-[13px] text-label-2">It may have been renamed or removed.</p>
        <ButtonLink href="/" variant="secondary" size="sm" className="mt-6">
          Back to Library
        </ButtonLink>
      </main>
    </>
  );
}
