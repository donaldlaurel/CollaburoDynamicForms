# Launch Checklist

Pre-launch hardening shipped in the codebase (June 2026) plus the account-level
steps that need the **Cloudflare** and **Neon** account owner (Kristelle) to do them.

## Done in code (deploy to activate)

- All API routes now require admin auth except the two the public booking flow
  needs: `GET /api/admin-state` (sanitized — client progress records / PII are
  stripped for unauthenticated visitors) and `POST /api/submissions`.
- Admin auth now **fails closed**: if `ADMIN_PASSWORD` is not set in production,
  `/admin` returns 503 instead of being wide open.
- Best-effort per-IP rate limiting in middleware (see "Cloudflare" below for the
  real fix).
- Stale-write protection on admin saves: if another device/tab saved newer
  changes, the save is rejected with a clear message instead of silently
  overwriting them.
- Duplicate booking submissions are deduplicated by email + space + date + total.
- The admin now shows a visible error if it can't reach the database on page
  load (previously silent — this masked the data-loss incident).

## Account owner actions (Kristelle)

### 1. Cloudflare — secrets (required, before/with next deploy)

Verify all production secrets are set:

```bash
wrangler secret list
# must include: DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD,
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, RESEND_API_KEY
```

`ADMIN_PASSWORD` is now mandatory in production — the admin locks itself (503)
without it. Use a long, unique password.

### 2. Cloudflare — WAF rate-limiting rules (recommended, ~10 min)

The in-app rate limiting is per-datacenter and best-effort. Add real rules in
**Cloudflare dashboard → the collaburo Worker's zone → Security → WAF → Rate
limiting rules**:

| Rule | Expression | Limit |
|---|---|---|
| Booking submissions | URI path equals `/api/submissions` and method `POST` | 10 requests / 10 min per IP |
| Email sends | URI path starts with `/api/send-email` | 30 requests / 10 min per IP |
| Image uploads | URI path starts with `/api/uploads` | 100 requests / 10 min per IP |
| Config reads | URI path equals `/api/admin-state` | 120 requests / 1 min per IP |

Action: **Block**, duration 10 minutes. (Free plan allows 1 rate-limiting rule —
if limited to one, use the Booking submissions rule.)

### 3. Neon — backups (required, ~5 min to verify)

We already lost data once. Verify recovery is possible:

- Neon console → project → **Settings → Storage / History retention**. Free tier
  keeps ~6 hours — 24 hours of point-in-time restore (PITR) requires a paid plan.
  **Recommended: enable a plan with ≥ 7 days history retention.**
- Either way, periodically export a snapshot:
  ```bash
  curl -u admin:PASSWORD https://<production-domain>/api/admin-state > backup-$(date +%F).json
  ```
  (A snapshot from 2026-06-08 lives in `docs/backups/`.)

### 4. Resend — domain + alert (recommended)

- Confirm the sending domain is verified in Resend (SPF/DKIM) so progress emails
  don't land in spam.
- Turn on Resend usage notifications so unexpected volume (abuse) is noticed.

## Post-deploy verification

```bash
# 1. Public config is sanitized (must NOT contain "progressRecords"):
curl -s https://<domain>/api/admin-state | grep -c progressRecords   # expect 0

# 2. Submissions list is locked (expect 401):
curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/submissions

# 3. Email relay is locked (expect 401):
curl -s -o /dev/null -w '%{http_code}' -X POST https://<domain>/api/send-email

# 4. Uploads are locked (expect 401):
curl -s -o /dev/null -w '%{http_code}' -X POST https://<domain>/api/uploads/images

# 5. Admin state writes are locked (expect 401):
curl -s -o /dev/null -w '%{http_code}' -X PUT https://<domain>/api/admin-state

# 6. Admin still works with credentials (expect 200):
curl -s -o /dev/null -w '%{http_code}' -u admin:PASSWORD https://<domain>/api/submissions
```

Then in a browser: log in to `/admin`, confirm data loads, make a small change,
Save, refresh — the change should persist. Open `/book` in a private window and
confirm the booking flow still renders and submits.

## Known items deferred (next iteration)

- Replace shared-password Basic Auth with real session login.
- Activity Timeline is still localStorage-only (doesn't sync across devices).
- No automated tests/CI; no error monitoring (consider Sentry).
- Admin state is one growing JSONB blob — watch its size as progress records grow.
