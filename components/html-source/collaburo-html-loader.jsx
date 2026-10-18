"use client";

import dynamic from "next/dynamic";

const CollaburoHtmlApp = dynamic(() => import("./collaburo-html-app"), {
  ssr: false,
  loading: () => (
    <div className="admin-boot-loading" role="status" aria-busy="true" aria-label="Loading Collaburo Admin">
      <aside className="admin-boot-side" aria-hidden="true" />
      <div className="admin-boot-main">
        <div className="admin-boot-topbar" aria-hidden="true" />
        <div className="admin-boot-card">
          <div className="contract-loading-spinner" />
          <p>Loading Collaburo Admin…</p>
        </div>
      </div>
    </div>
  ),
});

export default function CollaburoHtmlLoader({ initialSection = "workflow", publicMode = false, bookingSummaryMode = false }) {
  return <CollaburoHtmlApp initialSection={initialSection} publicMode={publicMode} bookingSummaryMode={bookingSummaryMode} />;
}
