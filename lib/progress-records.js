// Upper bound on the progressRecords list kept in the admin-state blob. Saves trim
// the list to this length, so it must stay above the real booking count (which
// includes imported legacy bookings) or the oldest records are silently dropped.
export const MAX_PROGRESS_RECORDS = 2000;
