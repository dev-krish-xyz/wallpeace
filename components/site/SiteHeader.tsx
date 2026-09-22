import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { NavLinks } from "./NavLinks";

/** Toolbar for every public page: logo on the left, site navigation on the right. */
export function SiteHeader() {
  return <Toolbar left={<Brand />} right={<NavLinks />} />;
}
