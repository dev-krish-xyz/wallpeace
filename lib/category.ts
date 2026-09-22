export type Collection = { slug: string; name: string; blurb: string | null };

export const CATEGORY_COLUMNS = "slug,name,blurb,position";
export const MAX_CATEGORY_NAME = 60;
export const MAX_CATEGORY_BLURB = 200;
