import CollaburoHtmlLoader from "@/components/html-source/collaburo-html-loader";
import { allSectionIds } from "@/lib/navigation";
import { notFound } from "next/navigation";

export default async function AdminSectionPage({ params }) {
  const { section } = await params;
  if (!allSectionIds.includes(section)) notFound();
  return <CollaburoHtmlLoader initialSection={section} />;
}
