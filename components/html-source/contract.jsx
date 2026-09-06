"use client";

import React from "react";

const CONTRACT_BLOCK_TYPES = [
  { id: "header", label: "Header" },
  { id: "paragraph", label: "Paragraph" },
  { id: "image", label: "Image" },
  { id: "signature", label: "Signature" },
];

function contractUid(prefix = "blk") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultContractSettings() {
  return {
    version: 1,
    title: "Event Space Rental Agreement",
    blocks: [
      {
        id: "blk_header",
        type: "header",
        fields: [
          { id: "fld_title", label: "Title", value: "Collaburo Event Space Rental Agreement" },
          { id: "fld_address", label: "Address", value: "123 Example Street, Ottawa, ON" },
          { id: "fld_contact", label: "Contact", value: "info@collaburo.com" },
        ],
      },
      {
        id: "blk_rental",
        type: "paragraph",
        title: "Rental Agreement",
        body: "This agreement is entered into between the venue owner and {{Client_Name}} ({{Organization}}) for the booking of {{Space}} on {{Booking_Start_datetime}}.\n\nEvent type: {{Event_Type}}\nExpected attendees: {{Expected_Number_of_Attendees}}\n\nCost summary:\n{{Cost_Breakdown}}\n\nBy signing below, the client agrees to the rental terms, payment schedule, and house rules described in this contract.",
        allowTokens: true,
      },
      {
        id: "blk_waiver",
        type: "paragraph",
        title: "Liability Waiver & Release",
        body: "The client acknowledges the risks associated with using the rented space and releases the venue from liability for injuries or damages arising from the event, except where prohibited by law.\n\nSelected items and services:\n{{Item_Details}}",
        allowTokens: true,
      },
      {
        id: "blk_addendum",
        type: "paragraph",
        title: "Addendum",
        body: "Security deposit: {{Security_Deposit}} {{Security_Deposit_Note}}\nTotal with deposit: {{Total_With_Deposit}}\n\nAdditional policies covering payment, security deposits, insurance, furniture, and house rules apply to this booking. Contact the venue with any questions before signing.\n\nAgreement dated {{Today_Date}}.",
        allowTokens: true,
      },
      {
        id: "blk_owner_sig",
        type: "signature",
        role: "owner",
        label: "Venue / Owner Signature",
        required: true,
        ownerImageUrl: "",
        ownerName: "Managing Director",
      },
      {
        id: "blk_client_sig",
        type: "signature",
        role: "client",
        label: "Client Signature",
        required: true,
      },
      {
        id: "blk_client_sig2",
        type: "signature",
        role: "client",
        label: "Client Signature (Liability Waiver)",
        required: true,
      },
    ],
  };
}

export function normalizeContractSettings(settings = {}) {
  const sample = createDefaultContractSettings();
  const source = settings && typeof settings === "object" ? settings : {};
  const blocks = Array.isArray(source.blocks) && source.blocks.length
    ? source.blocks.map((block) => normalizeContractBlock(block))
    : sample.blocks;
  return {
    version: Number(source.version || sample.version) || 1,
    title: String(source.title || sample.title || "Contract"),
    blocks,
  };
}

function normalizeContractBlock(block = {}) {
  const type = CONTRACT_BLOCK_TYPES.some((item) => item.id === block.type) ? block.type : "paragraph";
  const id = block.id || contractUid("blk");
  if (type === "header") {
    const fields = Array.isArray(block.fields) && block.fields.length
      ? block.fields.map((field) => ({
          id: field.id || contractUid("fld"),
          label: String(field.label || "Field"),
          value: String(field.value || ""),
        }))
      : [{ id: contractUid("fld"), label: "Title", value: "" }];
    return { id, type, fields };
  }
  if (type === "image") {
    return {
      id,
      type,
      label: String(block.label || "Image"),
      url: String(block.url || ""),
      alt: String(block.alt || ""),
    };
  }
  if (type === "signature") {
    const role = block.role === "owner" ? "owner" : "client";
    return {
      id,
      type,
      role,
      label: String(block.label || (role === "owner" ? "Owner Signature" : "Client Signature")),
      required: block.required !== false,
      ownerImageUrl: String(block.ownerImageUrl || ""),
      ownerName: String(block.ownerName || ""),
    };
  }
  return {
    id,
    type: "paragraph",
    title: String(block.title || ""),
    body: String(block.body || ""),
    allowTokens: block.allowTokens !== false,
  };
}

function fillContractTokens(text, tokenMap = {}) {
  return String(text || "").replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}?/g, (token, name) => {
    const canonical = `{{${name}}}`;
    const value = tokenMap[canonical];
    return value == null ? token : String(value);
  });
}

export function SignaturePad({ value, onChange, height = 160, disabled = false }) {
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);
  const last = React.useRef(null);

  const syncEmpty = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false;
    }
    return true;
  }, []);

  const emit = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;
    if (syncEmpty()) onChange("");
    else onChange(canvas.toDataURL("image/png"));
  }, [onChange, syncEmpty]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange && onChange("");
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.clientWidth || 450;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    if (value && value.startsWith("data:")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = value;
    }
  }, [height]); // eslint-disable-line react-hooks/exhaustive-deps -- redraw on mount/size only

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const start = (event) => {
    if (disabled) return;
    event.preventDefault();
    drawing.current = true;
    last.current = pointFromEvent(event);
  };

  const move = (event) => {
    if (!drawing.current || disabled) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const next = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last.current = next;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    emit();
  };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height, display: "block", touchAction: "none", cursor: disabled ? "not-allowed" : "crosshair", background: "#fafafa" }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "8px 10px", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
        <button type="button" className="btn-gray sm" onClick={clear} disabled={disabled}>Clear</button>
      </div>
    </div>
  );
}

function ContractBlockPreview({ block, tokenMap = {}, signatures = {}, interactive = false, onSignatureChange, onDuplicateSignature, firstClientSignature = "" }) {
  if (block.type === "header") {
    return (
      <div style={{ marginBottom: 18, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {(block.fields || []).map((field) => (
          <div key={field.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.04 }}>{field.label}</div>
            <div style={{ fontSize: field.label?.toLowerCase() === "title" ? 22 : 14, fontWeight: field.label?.toLowerCase() === "title" ? 700 : 500, whiteSpace: "pre-wrap" }}>
              {fillContractTokens(field.value, tokenMap)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "paragraph") {
    return (
      <div style={{ marginBottom: 18 }}>
        {block.title ? <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{fillContractTokens(block.title, tokenMap)}</h3> : null}
        <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.55 }}>{fillContractTokens(block.body, tokenMap)}</div>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div style={{ marginBottom: 18 }}>
        {block.label ? <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{block.label}</div> : null}
        {block.url
          ? <img src={block.url} alt={block.alt || ""} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--line)" }} />
          : <div style={{ border: "1px dashed var(--line-strong)", borderRadius: 8, padding: 24, color: "var(--ink-3)", textAlign: "center" }}>No image</div>}
      </div>
    );
  }
  if (block.type === "signature") {
    const signedUrl = signatures[block.id] || (block.role === "owner" ? block.ownerImageUrl : "");
    return (
      <div style={{ marginBottom: 18, border: "1px solid var(--line)", borderRadius: 10, padding: 14, background: "#fff" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{block.label}{block.required ? <span style={{ color: "var(--danger)" }}> *</span> : null}</div>
        {block.role === "owner" ? (
          signedUrl
            ? <img src={signedUrl} alt="Owner signature" style={{ maxWidth: 280, maxHeight: 120, objectFit: "contain" }} />
            : <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Owner signature image not uploaded yet.</div>
        ) : interactive ? (
          <div style={{ display: "grid", gap: 8 }}>
            {firstClientSignature && !signatures[block.id] ? (
              <button type="button" className="btn dark sm" onClick={() => onDuplicateSignature && onDuplicateSignature(block.id, firstClientSignature)}>
                Insert Same Signature
              </button>
            ) : null}
            <SignaturePad value={signatures[block.id] || ""} onChange={(dataUrl) => onSignatureChange && onSignatureChange(block.id, dataUrl)} />
          </div>
        ) : (
          signedUrl
            ? <img src={signedUrl} alt="Client signature" style={{ maxWidth: 280, maxHeight: 120, objectFit: "contain" }} />
            : <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Awaiting client signature</div>
        )}
        {block.role === "owner" && block.ownerName ? <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>{block.ownerName}</div> : null}
      </div>
    );
  }
  return null;
}

export function ContractDocumentView({
  settings,
  tokenMap = {},
  signatures = {},
  interactive = false,
  onSignatureChange,
  title,
}) {
  const contract = normalizeContractSettings(settings);
  const clientBlocks = (contract.blocks || []).filter((block) => block.type === "signature" && block.role === "client");
  const firstClientId = clientBlocks[0]?.id;
  const firstClientSignature = firstClientId ? signatures[firstClientId] || "" : "";
  return (
    <div className="contract-document" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 22 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>{title || contract.title}</h2>
      {(contract.blocks || []).map((block) => (
        <ContractBlockPreview
          key={block.id}
          block={block}
          tokenMap={tokenMap}
          signatures={signatures}
          interactive={interactive}
          firstClientSignature={firstClientSignature}
          onSignatureChange={onSignatureChange}
          onDuplicateSignature={(blockId, dataUrl) => onSignatureChange && onSignatureChange(blockId, dataUrl)}
        />
      ))}
    </div>
  );
}

async function uploadDataUrlImage(dataUrl, filename, folder = "collaburo/contracts") {
  if (!dataUrl || !String(dataUrl).startsWith("data:")) return dataUrl || "";
  const response = await fetch("/api/uploads/images", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dataUrl, filename, folder }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !(data.file?.secureUrl || data.image?.secureUrl)) {
    throw new Error(data.error || "Upload failed.");
  }
  return data.file?.secureUrl || data.image?.secureUrl;
}

function ContractImageUpload({ value, onChange, label = "Upload image" }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      const url = await uploadDataUrlImage(dataUrl, file.name || "contract-image.png");
      onChange(url);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {value ? <img src={value} alt="" style={{ maxWidth: 240, maxHeight: 100, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }} /> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label className="btn dark sm" style={{ cursor: "pointer" }}>
          {busy ? "Uploading…" : label}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={onFile} />
        </label>
        {value ? <button type="button" className="btn-gray sm" onClick={() => onChange("")}>Remove</button> : null}
      </div>
      {error ? <div style={{ color: "var(--danger)", fontSize: 12 }}>{error}</div> : null}
    </div>
  );
}

export function ContractSettingsView({ settings, onChange, dynamicFields = [] }) {
  const Ic = window.Icons || {};
  const site = settings || {};
  const contract = normalizeContractSettings(site.contractSettings);
  const previewTokenMap = {
    "{{Client_Name}}": "Alex Client",
    "{{Organization}}": "Acme Co",
    "{{Email}}": "alex@example.com",
    "{{Phone}}": "613-555-0100",
    "{{Booking_ID}}": "B12ABC",
    "{{Space}}": "Large Room",
    "{{Event_Type}}": "Workshop / Training",
    "{{Expected_Number_of_Attendees}}": "40",
    "{{Booking_Start_datetime}}": "Jun 18, 2026 04:00 pm",
    "{{Booking_end_datetime}}": "Jun 18, 2026 08:00 pm",
    "{{Booking_DateTime}}": "Jun 18, 2026 04:00 pm - Jun 18, 2026 08:00 pm",
    "{{Space_Rental_Total}}": "$450.00",
    "{{Total}}": "$612.00",
    "{{Total_With_Deposit}}": "$1,112.00",
    "{{Security_Deposit}}": "$500.00",
    "{{Security_Deposit_Note}}": "Refundable after inspection",
    "{{Cost_Breakdown}}": "Space Rental ($450.00)\nLarge Room — 4 hrs: $450.00\n\nSpace Content / Rentals ($80.00)\nChairs x 40: $80.00\n\nSubtotal: $530.00\nTotal: $612.00\nSecurity Deposit: $500.00\nTotal with Deposit: $1,112.00",
    "{{Item_Details}}": "Large Room — 4 hrs: $450.00\nChairs x 40: $80.00\nBasic catering package: $120.00",
    "{{Today_Date}}": "September 6, 2026",
  };
  const update = (patch) => {
    onChange({
      ...site,
      contractSettings: normalizeContractSettings({ ...contract, ...patch }),
    });
  };
  const updateBlock = (id, patch) => {
    update({
      blocks: contract.blocks.map((block) => (block.id === id ? normalizeContractBlock({ ...block, ...patch }) : block)),
    });
  };
  const moveBlock = (id, direction) => {
    const index = contract.blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= contract.blocks.length) return;
    const blocks = contract.blocks.slice();
    const [item] = blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, item);
    update({ blocks });
  };
  const removeBlock = (id) => update({ blocks: contract.blocks.filter((block) => block.id !== id) });
  const addBlock = (type) => {
    let block;
    if (type === "header") {
      block = { id: contractUid("blk"), type: "header", fields: [{ id: contractUid("fld"), label: "Title", value: "" }, { id: contractUid("fld"), label: "Address", value: "" }] };
    } else if (type === "image") {
      block = { id: contractUid("blk"), type: "image", label: "Image", url: "", alt: "" };
    } else if (type === "signature") {
      block = { id: contractUid("blk"), type: "signature", role: "client", label: "Client Signature", required: true };
    } else {
      block = { id: contractUid("blk"), type: "paragraph", title: "Section", body: "", allowTokens: true };
    }
    update({ blocks: [...contract.blocks, normalizeContractBlock(block)] });
  };

  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag">{Ic.File ? <Ic.File size={11} /> : null} Contract</span>
            <h1>Contract</h1>
            <p>Build a flexible contract template with headers, paragraphs, images, and signature areas. Other customers can reshape blocks without code changes.</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <label className="lbl">Contract Title</label>
          <input className="input" value={contract.title || ""} onChange={(e) => update({ title: e.target.value })} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {CONTRACT_BLOCK_TYPES.map((type) => (
            <button key={type.id} type="button" className="btn dark sm" onClick={() => addBlock(type.id)}>
              {Ic.Plus ? <Ic.Plus size={12} /> : "+"} Add {type.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,1fr) minmax(280px,.9fr)", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 14 }}>
            {contract.blocks.map((block, index) => (
              <div key={block.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 12, alignItems: "center" }}>
                  <strong style={{ textTransform: "capitalize" }}>{block.type} block</strong>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn icon sm ghost" title="Move up" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}>↑</button>
                    <button type="button" className="btn icon sm ghost" title="Move down" disabled={index === contract.blocks.length - 1} onClick={() => moveBlock(block.id, 1)}>↓</button>
                    <button type="button" className="btn icon sm ghost danger-ghost" title="Delete" onClick={() => removeBlock(block.id)}>{Ic.Trash ? <Ic.Trash size={13} /> : "×"}</button>
                  </div>
                </div>

                {block.type === "header" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    {(block.fields || []).map((field) => (
                      <div key={field.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 8 }}>
                        <input className="input" value={field.label} onChange={(e) => updateBlock(block.id, { fields: block.fields.map((item) => item.id === field.id ? { ...item, label: e.target.value } : item) })} placeholder="Label" />
                        <textarea className="textarea" rows={2} value={field.value} onChange={(e) => updateBlock(block.id, { fields: block.fields.map((item) => item.id === field.id ? { ...item, value: e.target.value } : item) })} placeholder="Value" />
                        <button type="button" className="btn-gray sm" onClick={() => updateBlock(block.id, { fields: block.fields.filter((item) => item.id !== field.id) })}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="btn-gray sm" onClick={() => updateBlock(block.id, { fields: [...(block.fields || []), { id: contractUid("fld"), label: "Field", value: "" }] })}>Add field</button>
                  </div>
                )}

                {block.type === "paragraph" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Section title</label>
                      <input className="input" value={block.title || ""} onChange={(e) => updateBlock(block.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="lbl">Paragraph content</label>
                      <textarea className="textarea" rows={7} value={block.body || ""} onChange={(e) => updateBlock(block.id, { body: e.target.value })} />
                    </div>
                  </div>
                )}

                {block.type === "image" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Label</label>
                      <input className="input" value={block.label || ""} onChange={(e) => updateBlock(block.id, { label: e.target.value })} />
                    </div>
                    <ContractImageUpload value={block.url || ""} onChange={(url) => updateBlock(block.id, { url })} label="Attach image" />
                  </div>
                )}

                {block.type === "signature" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Label</label>
                      <input className="input" value={block.label || ""} onChange={(e) => updateBlock(block.id, { label: e.target.value })} />
                    </div>
                    <div>
                      <label className="lbl">Role</label>
                      <select className="select" value={block.role || "client"} onChange={(e) => updateBlock(block.id, { role: e.target.value })}>
                        <option value="owner">Owner</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                    <label className="chk">
                      <input type="checkbox" checked={block.required !== false} onChange={(e) => updateBlock(block.id, { required: e.target.checked })} />
                      Required
                    </label>
                    {block.role === "owner" && (
                      <>
                        <div>
                          <label className="lbl">Owner name / title</label>
                          <input className="input" value={block.ownerName || ""} onChange={(e) => updateBlock(block.id, { ownerName: e.target.value })} />
                        </div>
                        <ContractImageUpload value={block.ownerImageUrl || ""} onChange={(url) => updateBlock(block.id, { ownerImageUrl: url })} label="Attach owner signature" />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {contract.blocks.length === 0 && (
              <div style={{ border: "1px dashed var(--line-strong)", borderRadius: 10, padding: 24, textAlign: "center", color: "var(--ink-3)" }}>
                No blocks yet. Add a header, paragraph, image, or signature block.
              </div>
            )}
          </div>

          <div>
            <div style={{ position: "sticky", top: 12, display: "grid", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Live preview</h3>
                <ContractDocumentView settings={contract} tokenMap={previewTokenMap} />
              </div>
              <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Dynamic Fields List</h3>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-3)" }}>
                  Type these tokens in header fields or paragraph content. They are replaced from the Progress List record when the contract is generated / signed.
                </p>
                <div style={{ columns: 1, fontSize: 12, lineHeight: 1.55, maxHeight: 360, overflow: "auto" }}>
                  {(dynamicFields.length ? dynamicFields : [
                    ["{{Client_Name}}", "Name of Client"],
                    ["{{Space}}", "Selected space"],
                    ["{{Booking_Start_datetime}}", "Starting date/time"],
                    ["{{Cost_Breakdown}}", "Full cost breakdown"],
                    ["{{Item_Details}}", "Selected item lines"],
                    ["{{Total}}", "Contract total"],
                  ]).map(([token, desc]) => (
                    <div key={token}><b>{token}</b> = {desc}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSignedContractHtml(settings, tokenMap, signatures) {
  const contract = normalizeContractSettings(settings);
  const escape = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const parts = [`<h1>${escape(contract.title)}</h1>`];
  (contract.blocks || []).forEach((block) => {
    if (block.type === "header") {
      (block.fields || []).forEach((field) => {
        parts.push(`<p><strong>${escape(field.label)}:</strong> ${escape(fillContractTokens(field.value, tokenMap))}</p>`);
      });
    } else if (block.type === "paragraph") {
      if (block.title) parts.push(`<h2>${escape(fillContractTokens(block.title, tokenMap))}</h2>`);
      parts.push(`<p>${escape(fillContractTokens(block.body, tokenMap)).replace(/\n/g, "<br/>")}</p>`);
    } else if (block.type === "image" && block.url) {
      parts.push(`<p><img src="${escape(block.url)}" alt="${escape(block.alt)}" style="max-width:100%"/></p>`);
    } else if (block.type === "signature") {
      const url = signatures[block.id] || (block.role === "owner" ? block.ownerImageUrl : "");
      parts.push(`<h3>${escape(block.label)}</h3>`);
      if (url) parts.push(`<p><img src="${escape(url)}" alt="signature" style="max-width:280px;max-height:120px"/></p>`);
      if (block.ownerName) parts.push(`<p>${escape(block.ownerName)}</p>`);
    }
  });
  return `<!doctype html><html><body style="font-family:Georgia,serif;padding:24px;color:#111">${parts.join("")}</body></html>`;
}

export function ContractSignView({ record, siteSettings, tokenMap, onSigned, onError }) {
  const contract = normalizeContractSettings(siteSettings?.contractSettings);
  const [signatures, setSignatures] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const status = record?.progress?.contract || "Not Generated";
  const alreadySigned = record?.progress?.agreement === "Signed";
  const canSign = !alreadySigned && (status === "Generated" || status === "Sent");

  const clientBlocks = (contract.blocks || []).filter((block) => block.type === "signature" && block.role === "client" && block.required !== false);
  const missing = clientBlocks.filter((block) => !signatures[block.id]);

  const setSignature = (blockId, dataUrl) => setSignatures((prev) => ({ ...prev, [blockId]: dataUrl }));

  const submit = async () => {
    if (!canSign || missing.length || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const uploadedSignatures = {};
      for (const [blockId, dataUrl] of Object.entries(signatures)) {
        uploadedSignatures[blockId] = await uploadDataUrlImage(dataUrl, `signature-${blockId}.png`, "collaburo/signatures");
      }
      (contract.blocks || []).forEach((block) => {
        if (block.type === "signature" && block.role === "owner" && block.ownerImageUrl) {
          uploadedSignatures[block.id] = block.ownerImageUrl;
        }
      });
      const html = buildSignedContractHtml(contract, tokenMap, uploadedSignatures);
      const htmlDataUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
      let agreementFile = null;
      try {
        const agreementUrl = await uploadDataUrlImage(htmlDataUrl, `contract-${record.bookingCode || record.id}.html`, "collaburo/contracts");
        agreementFile = { name: `Signed Contract ${record.bookingCode || record.id}.html`, url: agreementUrl, type: "text/html" };
      } catch {
        agreementFile = { name: `Signed Contract ${record.bookingCode || record.id}.html`, url: htmlDataUrl, type: "text/html" };
      }

      const response = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordId: record.id || record.bookingCode,
          baseRecord: record,
          signatures: uploadedSignatures,
          agreementFile,
          signedHtml: html,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not submit signed contract.");
      if (data.record?.id) {
        try {
          await fetch("/api/submissions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "update-progress-record", record: data.record }),
          });
        } catch {
          // Best-effort sync for memory-mode local dev.
        }
      }
      setMessage("Contract submitted successfully. A copy will be emailed shortly.");
      onSigned && onSigned(data.record || null);
    } catch (error) {
      const text = error.message || "Could not submit signed contract.";
      setMessage(text);
      onError && onError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!record) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>Contract unavailable</h1>
          <p style={{ color: "var(--ink-3)" }}>This booking could not be found, or the record link is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!canSign) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>{alreadySigned ? "Already signed" : "Contract unavailable"}</h1>
          <p style={{ color: "var(--ink-3)" }}>
            {alreadySigned
              ? "This booking agreement has already been signed."
              : "This contract link is not ready yet. Ask the venue to generate and send the contract first."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2, #f5f5f5)", padding: "24px 16px 120px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 14, color: "var(--ink-3)", fontSize: 13 }}>
          Booking {record.bookingCode || record.id} · {record.client?.name || "Client"}
        </div>
        <ContractDocumentView
          settings={contract}
          tokenMap={tokenMap}
          signatures={signatures}
          interactive
          onSignatureChange={setSignature}
        />
        {message ? <div style={{ marginTop: 12, color: message.includes("success") ? "var(--ok, #1a7f37)" : "var(--danger)" }}>{message}</div> : null}
      </div>
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: "1px solid var(--line)", padding: "12px 16px", display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          type="button"
          className="btn dark"
          disabled={submitting || missing.length > 0}
          onClick={submit}
          style={{ minWidth: 220 }}
        >
          {submitting ? "Submitting…" : "Submit Signed Contract"}
        </button>
      </div>
    </div>
  );
}

export { CONTRACT_BLOCK_TYPES, fillContractTokens, buildSignedContractHtml };
