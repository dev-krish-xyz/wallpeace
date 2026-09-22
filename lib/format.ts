// Fixed time zone so the server (UTC on Vercel) and the visitor's browser render the same date;
// otherwise the text differs near midnight and React reports a hydration mismatch.
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatResolution = (w: number, h: number) => `${w} × ${h}`;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function formatAspect(w: number, h: number) {
  const known: [number, string][] = [
    [16 / 10, "16:10"],
    [16 / 9, "16:9"],
    [21 / 9, "21:9"],
    [32 / 9, "32:9"],
    [4 / 3, "4:3"],
    [3 / 2, "3:2"],
    [1, "1:1"],
  ];
  const r = w / h;
  const match = known.find(([k]) => Math.abs(k - r) < 0.01);
  if (match) return match[1];
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}
