<#
.SYNOPSIS
  Converts bookings from the old Collaburo site's MySQL dump into progress records
  for the new app, and writes re-runnable SQL batches for the Neon SQL Editor.

.DESCRIPTION
  Reads `addrentalprogress` (bookings) and `contract` (totals) from the dump, keeps
  bookings whose earliest booking date is before -BeforeYear, and writes to -OutDir:
    legacy-bookings.json      every converted record, for review
    legacy-import-NN.sql      batches of -BatchSize records (skipped with -DryRun)
  Each SQL batch is one transaction that inserts into collaburo_submissions and
  appends to progressRecords in collaburo_app_config, skipping ids already present.
  The admin dashboard's "Import old bookings" button does the same conversion in the
  browser (components/html-source/legacy-import.js); keep the two mappings in sync.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\legacy-import\convert-legacy-dump.ps1 -DumpPath C:\Users\user\Downloads\muslim19_collaburospace.sql -DryRun
#>
param(
  [Parameter(Mandatory = $true)][string]$DumpPath,
  [string]$OutDir = "",
  [int]$BeforeYear = 2026,
  [int]$BatchSize = 50,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
if (-not $OutDir) { $OutDir = Join-Path $PSScriptRoot "..\..\import" }
$Culture = [Globalization.CultureInfo]::InvariantCulture
$WantedTables = @("addrentalprogress", "contract")

# ---------------------------------------------------------------------------
# Dump parsing (phpMyAdmin format: one row per line inside each INSERT block)
# ---------------------------------------------------------------------------

$TokenPattern = [regex]"'((?:[^'\\]|\\.|'')*)'|(NULL)|0x([0-9a-fA-F]*)|(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)"

function ConvertFrom-MySqlString([string]$text) {
  [regex]::Replace($text, "\\(.)|''", {
    param($m)
    if ($m.Value -eq "''") { return "'" }
    switch -CaseSensitive ($m.Groups[1].Value) {
      "n" { "`n" } "r" { "`r" } "t" { "`t" } "0" { "" } "Z" { "" }
      default { $m.Groups[1].Value }
    }
  })
}

function ConvertFrom-Hex([string]$hex) {
  if (-not $hex) { return "" }
  $bytes = New-Object byte[] ($hex.Length / 2)
  for ($i = 0; $i -lt $bytes.Length; $i++) { $bytes[$i] = [Convert]::ToByte($hex.Substring($i * 2, 2), 16) }
  [Text.Encoding]::UTF8.GetString($bytes)
}

function Read-DumpTables([string]$path, [string[]]$tables) {
  $result = @{}
  foreach ($t in $tables) { $result[$t] = New-Object System.Collections.ArrayList }
  $mismatches = 0
  $reader = New-Object IO.StreamReader($path, [Text.Encoding]::UTF8)
  $current = $null
  $columns = $null
  try {
    while ($null -ne ($line = $reader.ReadLine())) {
      if ($line -match '^INSERT INTO `([^`]+)` \((.*)\) VALUES') {
        $current = if ($tables -contains $Matches[1]) { $Matches[1] } else { $null }
        $columns = ($Matches[2] -replace '`', '').Split(",") | ForEach-Object { $_.Trim() }
        continue
      }
      if (-not $current) { continue }
      if (-not $line.StartsWith("(")) { $current = $null; continue }
      $values = New-Object System.Collections.ArrayList
      foreach ($m in $TokenPattern.Matches($line)) {
        if ($m.Groups[1].Success) { [void]$values.Add((ConvertFrom-MySqlString $m.Groups[1].Value)) }
        elseif ($m.Groups[2].Success) { [void]$values.Add($null) }
        elseif ($m.Groups[3].Success) { [void]$values.Add((ConvertFrom-Hex $m.Groups[3].Value)) }
        else { [void]$values.Add($m.Groups[4].Value) }
      }
      if ($values.Count -ne $columns.Count) { $mismatches++; continue }
      $row = @{}
      for ($i = 0; $i -lt $columns.Count; $i++) { $row[$columns[$i]] = $values[$i] }
      [void]$result[$current].Add($row)
    }
  } finally {
    $reader.Close()
  }
  if ($mismatches) { Write-Warning "$mismatches dump rows skipped because their value count did not match the column list." }
  $result
}

# ---------------------------------------------------------------------------
# Field helpers
# ---------------------------------------------------------------------------

function Text($value) { if ($null -eq $value) { "" } else { ([string]$value).Trim() } }

function Money($value) {
  $clean = (Text $value) -replace '[^0-9.\-]', ''
  $number = 0.0
  if ($clean -and [double]::TryParse($clean, [Globalization.NumberStyles]::Float, $Culture, [ref]$number)) { return [Math]::Round($number, 2) }
  0.0
}

function YesNo($value) { if ((Text $value) -match '^(yes|on|1|true)$') { "Yes" } else { "No" } }

$DateFormats = [string[]]@("MM/dd/yyyy hh:mm tt", "MM/dd/yyyy h:mm tt", "M/d/yyyy h:mm tt", "M/d/yyyy hh:mm tt", "MM/dd/yyyy")
function Parse-BookingDate($value) {
  $text = (Text $value) -replace '\s+', ' '
  if (-not $text) { return $null }
  $date = [datetime]::MinValue
  if ([datetime]::TryParseExact($text, $DateFormats, $Culture, [Globalization.DateTimeStyles]::None, [ref]$date)) { return $date }
  $null
}

function Format-BookingDate([datetime]$date) { $date.ToString("MMM dd, yyyy hh:mm tt", $Culture).Replace("AM", "am").Replace("PM", "pm") }

# Same hash as bookingCodeFromId() in collaburo-html-app.jsx.
function Get-BookingCode([string]$id) {
  [uint64]$hash = 0
  foreach ($ch in $id.ToCharArray()) { $hash = (($hash * 31) + [int]$ch) % 4294967296 }
  $digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  $out = ""
  do { $out = $digits[[int]($hash % 36)] + $out; $hash = [uint64][Math]::Floor($hash / 36) } while ($hash -gt 0)
  $padded = $out.PadLeft(5, "0")
  "B" + $padded.Substring($padded.Length - 5)
}

function Get-Label([string]$column) {
  $words = $column -replace '^(mh|lr|sr)_', '' -split '_' | Where-Object { $_ } | ForEach-Object { $_.Substring(0, 1).ToUpper() + $_.Substring(1) }
  $words -join " "
}

$Spaces = [ordered]@{ mh = "Main Hall"; lr = "Large Room"; sr = "Small Room" }
$ExtraSpaces = [ordered]@{ la_space = "Lounge Area"; ea_space = "Elevated Area"; bs_space = "Back Patio" }

$StatusMap = @{
  "paid" = "Paid"; "lost" = "Cancelled"; "active" = "In Discussion"; "hot" = "In Discussion"
  "initiated contact" = "Initiated Contact"; "not contacted" = "Not Contacted"
}
$InsuranceMap = @{ "obtained duuo" = "Obtained DUUO"; "client has own" = "Client has own"; "not required" = "Not Required"; "not received" = "Not Received" }
$SourceMap = @{ "returningclient" = "Returning Client"; "facebook" = "Social Media"; "instagram" = "Social Media"; "walkin" = "Walk-In"; "weddingwire" = "Wedding Wire" }

# Columns already mapped to dedicated fields; everything else that is filled in
# is listed under "Old booking details" in adminSections.specialNotes.
$MappedColumns = @(
  "id", "uniqueid", "requesteddate", "clientname", "lastname", "organization", "email", "phonenumber",
  "notforprofit", "studentbody", "interestlevel", "eventprivacy", "eventtype", "brief_desc_event", "alcoholserved",
  "exp_noofattendees", "exp_guestarrtime", "mh_space", "lr_space", "sr_space", "la_space", "ea_space", "bs_space",
  "mh_booking_start_date", "mh_booking_end_date", "lr_booking_start_date", "lr_booking_end_date",
  "sr_booking_start_date", "sr_booking_end_date", "internal_notes", "record_issues", "status", "source",
  "agreement", "insurance", "agco_license", "damage_waiver", "damage_waiver_custom", "damage_waiverrefund",
  "infocomplete", "lockform_user", "record_accesslink", "duuoeventtype", "catering", "catering_delivery_time",
  "setupservices", "clearupservices", "thirdpartyrentals", "age_status_new", "age_status_past", "generateBtnClick",
  "mh_layout_floorlayoutinstruction", "mh_layout_buffetlayoutinstructions", "mh_layout_stagelayoutinstructions",
  "lr_layout_floorlayoutinstruction", "lr_layout_buffetlayoutinstructions",
  "sr_layout_floorlayoutinstruction", "sr_layout_buffetlayoutinstructions"
)

# ---------------------------------------------------------------------------
# Conversion
# ---------------------------------------------------------------------------

function Convert-Booking($row, $contract) {
  $oldId = Text $row["id"]
  $id = "legacy_$oldId"

  $spaceNames = New-Object System.Collections.ArrayList
  $dateSegments = New-Object System.Collections.ArrayList
  $earliest = $null
  foreach ($prefix in $Spaces.Keys) {
    $start = Parse-BookingDate $row["${prefix}_booking_start_date"]
    $end = Parse-BookingDate $row["${prefix}_booking_end_date"]
    $used = (Text $row["${prefix}_space"]) -or $start
    if ($used) { [void]$spaceNames.Add($Spaces[$prefix]) }
    if ($start) {
      if (-not $earliest -or $start -lt $earliest) { $earliest = $start }
      $segment = "$($Spaces[$prefix]): $(Format-BookingDate $start)"
      if ($end) { $segment += " - $(Format-BookingDate $end)" }
      [void]$dateSegments.Add($segment)
    }
  }
  foreach ($column in $ExtraSpaces.Keys) {
    $value = Text $row[$column]
    if ($value -and $value -ne "0") { [void]$spaceNames.Add($ExtraSpaces[$column]) }
  }

  $oldStatus = Text $row["status"]
  $status = $StatusMap[$oldStatus.ToLower()]
  if (-not $status) { $status = if ($oldStatus) { $oldStatus } else { "In Discussion" } }
  $interestLevel = Text $row["interestlevel"]
  if (-not $interestLevel -and $oldStatus -eq "Hot") { $interestLevel = "Hot" }

  $depositCost = Text $row["damage_waiver"]
  if ($depositCost -eq "Custom Amount" -and (Text $row["damage_waiver_custom"])) { $depositCost = "`$" + (Text $row["damage_waiver_custom"]) }
  if (-not $depositCost) { $depositCost = "TBD" }

  $insurance = $InsuranceMap[(Text $row["insurance"]).ToLower()]
  if (-not $insurance) { $insurance = "Not Received" }
  $agco = Text $row["agco_license"]
  if (-not $agco) { $agco = "Not Received" }
  $agreement = if ((Text $row["agreement"]) -eq "Signed") { "Signed" } else { "Not Signed" }

  $source = Text $row["source"]
  $mappedSource = $SourceMap[($source -replace '[\s-]', '').ToLower()]
  if ($mappedSource) { $source = $mappedSource }

  $attendees = Text $row["exp_noofattendees"]
  $attendeeCount = if ($attendees -match '^\d+$') { [int]$attendees } else { $attendees }

  $instructions = New-Object System.Collections.ArrayList
  foreach ($prefix in $Spaces.Keys) {
    foreach ($kind in @("floorlayoutinstruction", "buffetlayoutinstructions", "stagelayoutinstructions")) {
      $value = Text $row["${prefix}_layout_$kind"]
      if ($value) { [void]$instructions.Add("$($Spaces[$prefix]) - $(Get-Label $kind): $value") }
    }
  }

  $details = New-Object System.Collections.ArrayList
  foreach ($column in ($row.Keys | Sort-Object)) {
    if ($MappedColumns -contains $column) { continue }
    $value = Text $row[$column]
    if (-not $value -or $value -eq "0" -or $value -eq "0000-00-00") { continue }
    $prefix = ($column -split "_")[0]
    $label = if ($Spaces.Contains($prefix)) { "$($Spaces[$prefix]) - $(Get-Label $column)" } else { Get-Label $column }
    [void]$details.Add("${label}: $value")
  }

  $serviceNotes = @(
    $(if (Text $row["setupservices"]) { "Set-up: $(Text $row['setupservices'])" }),
    $(if (Text $row["clearupservices"]) { "Clean-up: $(Text $row['clearupservices'])" }),
    $(if (Text $row["thirdpartyrentals"]) { "Third-party rentals: $(Text $row['thirdpartyrentals'])" })
  ) | Where-Object { $_ }

  $catering = @(
    $(Text $row["catering"]),
    $(if (Text $row["catering_delivery_time"]) { "Delivery time: $(Text $row['catering_delivery_time'])" })
  ) | Where-Object { $_ }

  $costs = [ordered]@{
    spaceRentalTotal = 0.0; spaceContentTotal = 0.0; cateringTotal = 0.0; setupTotal = 0.0; eventTotal = 0.0; cleanupTotal = 0.0
    subtotal = 0.0; feeLines = @(); total = 0.0; securityDeposit = 0.0; totalWithDeposit = 0.0
    spaceLines = @(); spaceContentLines = @(); cateringLines = @(); setupLines = @(); eventLines = @(); cleanupLines = @()
  }
  if ($contract) {
    $costs.spaceRentalTotal = Money $contract["space_rental_total"]
    $costs.spaceContentTotal = Money $contract["space_content_total"]
    $costs.setupTotal = Money $contract["setup_service_total"]
    $costs.eventTotal = Money $contract["eventservicescosttotal"]
    $costs.cleanupTotal = Money $contract["clearup_service_total"]
    $costs.subtotal = [Math]::Round($costs.spaceRentalTotal + $costs.spaceContentTotal + $costs.setupTotal + $costs.eventTotal + $costs.cleanupTotal, 2)
    $discount = Money $contract["discount"]
    $costs.total = [Math]::Round([Math]::Max([double]0, $costs.subtotal - $discount), 2)
    $costs.securityDeposit = Money $contract["space_damagewaiver_total"]
    $costs.totalWithDeposit = [Math]::Round($costs.total + $costs.securityDeposit, 2)
    if ($discount -gt 0) { $costs.feeLines = @([ordered]@{ label = "Discount"; total = -$discount; note = Text $contract["discount_notes"] }) }
    foreach ($column in @("space_rental_items", "space_contents")) {
      $value = Text $contract[$column]
      if ($value) { [void]$details.Add("Contract $(Get-Label $column):`n$value") }
    }
  }

  $requested = [datetime]::MinValue
  $submittedAt = if ([datetime]::TryParseExact((Text $row["requesteddate"]), "yyyy-MM-dd HH:mm:ss", $Culture, [Globalization.DateTimeStyles]::None, [ref]$requested)) {
    $requested.ToString("yyyy-MM-ddTHH:mm:ss", $Culture)
  } elseif ($earliest) { $earliest.ToString("yyyy-MM-ddTHH:mm:ss", $Culture) } else { "" }

  $name = ((Text $row["clientname"]) + " " + (Text $row["lastname"])).Trim()

  [pscustomobject]@{
    BookingDate = $earliest
    HasContract = [bool]$contract
    Record = [ordered]@{
      id = $id
      bookingCode = Get-BookingCode $id
      progressNo = [int]$oldId
      submittedAt = $submittedAt
      client = [ordered]@{ name = $name; organization = Text $row["organization"]; email = (Text $row["email"]).ToLower(); phone = Text $row["phonenumber"] }
      request = [ordered]@{
        eventPrivacy = Text $row["eventprivacy"]
        eventType = Text $row["eventtype"]
        alcoholOnSite = Text $row["alcoholserved"]
        attendeeCount = $attendeeCount
        description = Text $row["brief_desc_event"]
        space = ($spaceNames | Select-Object -Unique) -join ", "
        bookingDateTime = $dateSegments -join "; "
        guestsArrival = Text $row["exp_guestarrtime"]
        noOneOnSite = ""
      }
      progress = [ordered]@{
        interestLevel = $interestLevel
        status = $status
        age = "Archived"
        signed = ($agreement -eq "Signed")
        agreement = $agreement
        contract = if ($contract) { "Generated" } else { "Not Generated" }
        insurance = ($insurance -eq "Obtained DUUO" -or $insurance -eq "Client has own")
        insuranceStatus = $insurance
        agcoLicense = ($agco -eq "Obtained")
        agcoLicenseStatus = $agco
        infoComplete = ((Text $row["infocomplete"]) -eq "Complete")
        lockedForUser = ((Text $row["lockform_user"]) -eq "1")
        duuoEventType = if (Text $row["duuoeventtype"]) { Text $row["duuoeventtype"] } else { "Select One" }
        notForProfit = YesNo $row["notforprofit"]
        studentBody = YesNo $row["studentbody"]
        communityOrganization = "No"
        source = $source
        createdBy = "Legacy import"
        accessibleByRecordLink = ((Text $row["record_accesslink"]) -eq "1")
        securityDepositCost = $depositCost
        securityDepositNote = Text $row["damage_waiverrefund"]
        internalNotes = Text $row["internal_notes"]
        issues = Text $row["record_issues"]
        attachments = @()
      }
      costs = $costs
      adminSections = [ordered]@{
        instructions = $instructions -join "`n"
        specialNotes = if ($details.Count) { "Old booking details:`n" + ($details -join "`n") } else { "" }
        cateringSpecifics = $catering -join "`n"
        serviceNotes = $serviceNotes -join "`n"
      }
      emails = @()
      log = @([ordered]@{ label = "Legacy import"; at = (Get-Date).ToString("MMM dd, yyyy hh:mm tt", $Culture).Replace("AM", "am").Replace("PM", "pm"); action = "Imported from old site (record #$oldId, status `"$oldStatus`")" })
      legacy = [ordered]@{ id = [int]$oldId; uniqueid = Text $row["uniqueid"]; status = $oldStatus }
    }
  }
}

# ---------------------------------------------------------------------------
# SQL batches
# ---------------------------------------------------------------------------

function New-BatchSql([string]$json, [int]$number, [int]$total, [int]$count) {
  @"
-- Collaburo legacy booking import, batch $number of $total ($count bookings).
-- Safe to re-run: bookings whose id already exists are skipped.
begin;

do `$check`$
begin
  if not exists (select 1 from collaburo_app_config where key = 'default') then
    raise exception 'No saved admin state (collaburo_app_config key "default") found. Open and save the admin dashboard once before importing.';
  end if;
end
`$check`$;

create temp table legacy_import_batch on commit drop as
select t.rec, t.ord
from jsonb_array_elements(`$legacy`$$json`$legacy`$::jsonb) with ordinality as t(rec, ord);

insert into collaburo_submissions (client_name, client_email, event_space, status, total, payload, fingerprint, created_at)
select
  coalesce(nullif(b.rec->'client'->>'name', ''), 'New Client'),
  coalesce(b.rec->'client'->>'email', ''),
  coalesce(b.rec->'request'->>'space', ''),
  coalesce(b.rec->'progress'->>'status', 'In Discussion'),
  coalesce((b.rec->'costs'->>'totalWithDeposit')::numeric, 0),
  b.rec,
  null,
  (b.rec->>'submittedAt')::timestamp
from legacy_import_batch b
where not exists (
  select 1 from collaburo_submissions s where s.payload->>'id' = b.rec->>'id'
);

update collaburo_app_config c
set payload = jsonb_set(
      c.payload,
      '{progressRecords}',
      coalesce(case when jsonb_typeof(c.payload->'progressRecords') = 'array' then c.payload->'progressRecords' end, '[]'::jsonb)
        || coalesce((
          select jsonb_agg(b.rec order by b.ord)
          from legacy_import_batch b
          where not exists (
            select 1
            from jsonb_array_elements(case when jsonb_typeof(c.payload->'progressRecords') = 'array' then c.payload->'progressRecords' else '[]'::jsonb end) e
            where e->>'id' = b.rec->>'id'
          )
        ), '[]'::jsonb),
      true
    ) || jsonb_build_object('savedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where c.key = 'default';

commit;

select
  (select count(*) from collaburo_submissions where payload->>'id' like 'legacy\_%') as legacy_submissions,
  (select count(*) from collaburo_app_config c, jsonb_array_elements(c.payload->'progressRecords') e
     where c.key = 'default' and e->>'id' like 'legacy\_%') as legacy_progress_records;
"@
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if (-not (Test-Path $DumpPath)) { throw "Dump not found: $DumpPath" }
Write-Host "Reading $DumpPath ..."
$tables = Read-DumpTables $DumpPath $WantedTables
$bookings = $tables["addrentalprogress"]
Write-Host "Parsed $($bookings.Count) bookings and $($tables['contract'].Count) contracts."

$contracts = @{}
foreach ($c in ($tables["contract"] | Sort-Object { [int]$_["id"] })) { $contracts[(Text $c["uniqueid"])] = $c }

$converted = New-Object System.Collections.ArrayList
$noDate = 0
$tooNew = 0
foreach ($row in $bookings) {
  $item = Convert-Booking $row $contracts[(Text $row["uniqueid"])]
  if (-not $item.BookingDate) { $noDate++; continue }
  if ($item.BookingDate.Year -ge $BeforeYear) { $tooNew++; continue }
  [void]$converted.Add($item)
}
$converted = @($converted | Sort-Object BookingDate -Descending)
$records = @($converted | ForEach-Object { $_.Record })

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path
$utf8 = New-Object Text.UTF8Encoding($false)
$allJson = ConvertTo-Json -InputObject $records -Depth 20
[IO.File]::WriteAllText((Join-Path $OutDir "legacy-bookings.json"), $allJson, $utf8)

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Selected (booking date before $BeforeYear): $($records.Count)"
Write-Host "Skipped: $tooNew dated $BeforeYear or later, $noDate with no parseable booking date"
Write-Host "By year:";   $converted | Group-Object { $_.BookingDate.Year } | Sort-Object Name | ForEach-Object { Write-Host ("  {0}  {1}" -f $_.Name, $_.Count) }
Write-Host "By status (new app):"; $records | Group-Object { $_.progress.status } | Sort-Object Count -Descending | ForEach-Object { Write-Host ("  {0,-18} {1}" -f $_.Name, $_.Count) }
$withContract = @($converted | Where-Object HasContract)
$withTotal = @($records | Where-Object { $_.costs.totalWithDeposit -gt 0 })
Write-Host "With a contract row: $($withContract.Count); with a non-zero total: $($withTotal.Count)"
if ($withTotal.Count) {
  $sum = ($withTotal | ForEach-Object { $_.costs.totalWithDeposit } | Measure-Object -Sum -Maximum)
  Write-Host ("  Total sum: {0:N2}; largest: {1:N2}" -f $sum.Sum, $sum.Maximum)
}
Write-Host "Missing client name: $(@($records | Where-Object { -not $_.client.name }).Count); missing email: $(@($records | Where-Object { -not $_.client.email }).Count)"
Write-Host ("Size of all records as JSON: {0:N0} KB" -f ($utf8.GetByteCount($allJson) / 1KB))
Write-Host "Wrote $(Join-Path $OutDir 'legacy-bookings.json')"

if ($DryRun) {
  Write-Host "Dry run: no SQL batches written."
  return
}

Get-ChildItem $OutDir -Filter "legacy-import-*.sql" | Remove-Item
$batchCount = [int][Math]::Ceiling($records.Count / $BatchSize)
for ($b = 0; $b -lt $batchCount; $b++) {
  $slice = @($records[($b * $BatchSize)..([Math]::Min($records.Count, ($b + 1) * $BatchSize) - 1)])
  $json = ConvertTo-Json -InputObject $slice -Depth 20 -Compress
  if ($json.Contains('$legacy$')) { throw "Batch $($b + 1) contains the SQL quote marker `$legacy`$; cannot write it safely." }
  $file = Join-Path $OutDir ("legacy-import-{0:D2}.sql" -f ($b + 1))
  [IO.File]::WriteAllText($file, (New-BatchSql $json ($b + 1) $batchCount $slice.Count), $utf8)
}
Write-Host "Wrote $batchCount SQL batches to $OutDir (legacy-import-01.sql ... legacy-import-$('{0:D2}' -f $batchCount).sql)."
