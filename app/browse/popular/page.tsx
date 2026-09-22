import type { Metadata } from "next";
import { BrowseView, browseDescription, browseTitle } from "@/components/site/BrowseView";

export const metadata: Metadata = {
  title: browseTitle("popular"),
  description: browseDescription("popular"),
  alternates: { canonical: "/browse/popular" },
};

export default function BrowsePopularPage() {
  return <BrowseView sort="popular" />;
}
