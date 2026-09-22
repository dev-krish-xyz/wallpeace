import type { Metadata } from "next";
import { BrowseView, browseDescription, browseTitle } from "@/components/site/BrowseView";

export const metadata: Metadata = {
  title: browseTitle("latest"),
  description: browseDescription("latest"),
  alternates: { canonical: "/browse/latest" },
};

export default function BrowseLatestPage() {
  return <BrowseView sort="latest" />;
}
