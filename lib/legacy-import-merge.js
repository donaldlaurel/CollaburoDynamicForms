const text = (value) => String(value ?? "").trim();

function fieldDecision(currentValue, expectedValue, nextValue) {
  const current = text(currentValue);
  const expected = text(expectedValue);
  const next = text(nextValue);
  if (current === next) return { value: currentValue, status: "unchanged" };
  if (!current || current === expected) return { value: nextValue, status: "updated" };
  return { value: currentValue, status: "conflicted" };
}

export function repairLegacyRecord(existing = {}, incoming = {}) {
  const expected = incoming.legacy?.repairExpected || {};
  const date = fieldDecision(
    existing.request?.bookingDateTime,
    expected.bookingDateTime,
    incoming.request?.bookingDateTime
  );
  const space = fieldDecision(
    existing.request?.space,
    expected.space,
    incoming.request?.space
  );
  const statuses = [date.status, space.status];
  const conflictedFields = [];
  if (date.status === "conflicted") conflictedFields.push("request.bookingDateTime");
  if (space.status === "conflicted") conflictedFields.push("request.space");
  const changed = statuses.includes("updated");

  return {
    record: {
      ...existing,
      request: {
        ...(existing.request || {}),
        bookingDateTime: date.value,
        space: space.value,
      },
      legacy: {
        ...(existing.legacy || {}),
        dateMigrationVersion: Number(incoming.legacy?.dateMigrationVersion || 1),
        dateSources: incoming.legacy?.dateSources || existing.legacy?.dateSources || [],
      },
    },
    changed,
    conflictedFields,
  };
}

export function mergeLegacyRepairBatch(existing = [], incoming = []) {
  const incomingById = new Map(incoming.map((record) => [String(record?.id || ""), record]));
  const existingIds = new Set(existing.map((record) => String(record?.id || "")));
  let updated = 0;
  let conflicted = 0;
  let unchanged = 0;
  const conflictDetails = [];

  const kept = existing.map((record) => {
    const patch = incomingById.get(String(record?.id || ""));
    if (!patch) return record;
    const result = repairLegacyRecord(record, patch);
    if (result.conflictedFields.length) {
      conflicted += 1;
      conflictDetails.push({ id: String(record?.id || ""), fields: result.conflictedFields });
    }
    if (result.changed) updated += 1;
    else unchanged += 1;
    return result.record;
  });
  const fresh = incoming.filter((record) => (
    !existingIds.has(String(record?.id || "")) && record?.legacy?.importEligible !== false
  ));

  return {
    records: [...kept, ...fresh],
    added: fresh.length,
    updated,
    conflicted,
    unchanged,
    conflictDetails,
  };
}
