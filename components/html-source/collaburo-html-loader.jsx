"use client";

import dynamic from "next/dynamic";

const CollaburoHtmlApp = dynamic(() => import("./collaburo-html-app"), {
  ssr: false,
  loading: () => (
    <div className="contract-loading" role="status" aria-busy="true" aria-label="Loading">
      <div className="contract-loading-spinner" />
    </div>
  ),
});

export default function CollaburoHtmlLoader({ initialSection = "workflow", publicMode = false, bookingSummaryMode = false }) {
  return <CollaburoHtmlApp initialSection={initialSection} publicMode={publicMode} bookingSummaryMode={bookingSummaryMode} />;
}
