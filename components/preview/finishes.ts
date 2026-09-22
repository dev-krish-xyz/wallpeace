export type Finish = "silver" | "space-black";

/** `tint` recolors the model's aluminum materials; null keeps the authored silver. */
export const FINISHES: Record<Finish, { label: string; css: string; tint: string | null }> = {
  silver: { label: "Silver", css: "#d3d4d6", tint: null },
  "space-black": { label: "Space Black", css: "#2e2f32", tint: "#5a5c62" },
};
