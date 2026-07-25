"use client";

import dynamic from "next/dynamic";

const CollaburoHtmlApp = dynamic(() => import("./collaburo-html-app"), {
  ssr: false,
  loading: () => null,
});

export default function CollaburoHtmlLoader({ initialSection = "workflow", publicMode = false, bookingSummaryMode = false }) {
  return <CollaburoHtmlApp initialSection={initialSection} publicMode={publicMode} bookingSummaryMode={bookingSummaryMode} />;
}
