# Legacy booking import

The MariaDB dump is source data. Do not execute it directly against Neon.

Use one import path:

1. Recommended: Admin → Rentals Progress List → **Import old bookings**.
2. Alternative: run `convert-legacy-dump.ps1` without `-DryRun`, then execute the generated `import/legacy-import-XX.sql` files sequentially in the Neon SQL Editor.

Do not use both paths for the same dump. Generated SQL batches skip IDs that already exist and therefore do not repair an earlier import. Use the admin importer’s **Repair legacy dates and spaces** mode for that.

`-DryRun` rewrites `import/legacy-bookings.json` but intentionally leaves existing `legacy-import-XX.sql` files untouched. Never assume old batches match the latest JSON; regenerate them before a manual Neon import.

The dump and every generated artifact contain client personal data. They are gitignored and should be deleted after verification or retained only in encrypted backup storage.

Before importing:

- Create a Neon backup branch.
- Save the admin dashboard at least once so `collaburo_app_config` exists.
- Review the import summary and download the field audit.
- Investigate parse failures, duplicate links, suspicious encoding, and records without dates.

The repair mode:

- updates only `request.bookingDateTime` and `request.space`;
- preserves later admin edits and reports conflicts;
- synchronizes `progressRecords` and `collaburo_submissions`;
- adds newly recoverable Patio/Lounge bookings within the selected cutoff;
- is safe to rerun.
