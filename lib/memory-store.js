// In-memory fallback used when DATABASE_URL is unset. Every API route must share
// this one object: separate per-route copies drift apart, so a booking saved via
// /api/submissions would not appear in /api/admin-state after a refresh.
// Pinned to globalThis so dev hot-reloads and per-route bundles reuse it.
const memory = globalThis.__collaburoMemoryStore || (globalThis.__collaburoMemoryStore = {
  state: null,
  updatedAt: null,
  submissions: [],
});

export default memory;
