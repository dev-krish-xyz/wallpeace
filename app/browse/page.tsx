import type { Metadata } from "next";
import { BrowseView, browseDescription, browseTitle } from "@/components/site/BrowseView";

export const metadata: Metadata = {
  title: browseTitle("all"),
  description: browseDescription("all"),
  alternates: { canonical: "/browse" },
};

export default function BrowseAllPage() {
  return <BrowseView sort="all" />;
}
