export type Finish = "silver" | "space-black";

export const FINISHES: Record<Finish, { label: string; body: string; detail: string; trackpad: string; css: string }> = {
  silver: { label: "Silver", body: "#dcdddf", detail: "#b4b6b9", trackpad: "#d2d3d5", css: "#d3d4d6" },
  "space-black": { label: "Space Black", body: "#2d2e31", detail: "#18191b", trackpad: "#2a2b2e", css: "#2e2f32" },
};
