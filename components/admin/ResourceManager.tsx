"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Trash2,
  Search,
  ArrowLeft,
  Copy,
  LoaderCircle,
} from "lucide-react";
import {
  AdminImageField,
  type UploadFolder,
} from "@/components/admin/AdminImageField";
import { SafeImage } from "@/components/ui/SafeImage";
import { defaultServices } from "@/lib/defaults";
const names: Record<string, string> = {
  bookings: "Bookings",
  enquiries: "Enquiries",
  services: "Services",
  pages: "Page content",
  settings: "Site settings",
  media: "Media library",
};
const label = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (s) => s.toUpperCase());
export function ResourceManager({ resource }: { resource: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [folder, setFolder] = useState<UploadFolder>("misc");
  const [uploaded, setUploaded] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const q = new URLSearchParams({ search, status, page: String(page) });
      const res = await fetch("/api/admin/" + resource + "?" + q, {
        cache: "no-store",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      if (resource === "settings") {
        setDraft({ data: body.data });
        setRows([]);
      } else {
        setRows(body.data);
        setTotal(body.total || body.data.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load records.");
    } finally {
      setBusy(false);
    }
  }, [resource, search, status, page]);
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);
  const update = (key: string, value: any) =>
    setDraft((old: any) =>
      resource === "pages" || resource === "settings"
        ? { ...old, data: { ...old.data, [key]: value } }
        : { ...old, [key]: value },
    );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/" + resource, {
        method: resource === "services" && !draft._id ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success("Changes saved.");
      if (resource !== "settings") setDraft(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(row: any) {
    if (
      !confirm(
        resource === "media"
          ? "Delete this image permanently? Referenced images cannot be deleted."
          : "Delete this record permanently?",
      )
    )
      return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/" + resource, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row._id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success("Deleted.");
      if (draft?._id === row._id) setDraft(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete.");
    } finally {
      setSaving(false);
    }
  }
  const submission = ["bookings", "enquiries"].includes(resource);
  const statuses =
    resource === "bookings"
      ? [
          "New",
          "Contacted",
          "Confirmed",
          "In Progress",
          "Completed",
          "Cancelled",
        ]
      : ["New", "Read", "Resolved"];
  function editField(key: string, value: any) {
    if (
      key === "_id" ||
      key === "__v" ||
      key === "createdAt" ||
      key === "updatedAt" ||
      key === "key"
    )
      return null;
    if (/image|logo/i.test(key) && !/alt/i.test(key))
      return (
        <AdminImageField
          key={key}
          value={String(value || "")}
          onChange={(v) => update(key, v)}
          label={label(key)}
          folder="pages"
          onBusyChange={setUploading}
        />
      );
    if (typeof value === "boolean")
      return (
        <label className="checkbox-field" key={key}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => update(key, e.target.checked)}
          />
          {label(key)}
        </label>
      );
    const multiline = /description|text|intro|body|summary|notes/i.test(key);
    return (
      <label className="field" key={key}>
        {label(key)}
        {multiline ? (
          <textarea
            rows={4}
            value={value ?? ""}
            onChange={(e) => update(key, e.target.value)}
            maxLength={10000}
          />
        ) : (
          <input
            type={typeof value === "number" ? "number" : "text"}
            value={value ?? ""}
            onChange={(e) =>
              update(
                key,
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
            maxLength={2000}
          />
        )}
      </label>
    );
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">WEBSITE MANAGEMENT</p>
          <h1>{names[resource].toUpperCase()}.</h1>
          <p>
            {submission
              ? "Review requests, update statuses and keep internal notes."
              : resource === "media"
                ? "Images are stored in MongoDB and survive redeployments."
                : "Keep your website accurate and up to date."}
          </p>
        </div>
        {resource === "services" && !draft && (
          <button
            className="button"
            onClick={() =>
              setDraft({
                ...defaultServices[0],
                title: "",
                slug: "",
                summary: "",
                description: "",
                image: "",
                imageAlt: "",
                order: rows.length,
              })
            }
          >
            <Plus size={17} />
            Add service
          </button>
        )}
      </div>
      {error && (
        <div role="alert" className="setup-notice">
          {error}
          <button className="small-button" onClick={load}>
            Retry
          </button>
        </div>
      )}
      {resource === "media" && (
        <section className="admin-panel">
          <label className="field">
            Upload folder
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value as UploadFolder)}
            >
              {["products", "gallery", "pages", "misc"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <AdminImageField
            value={uploaded}
            folder={folder}
            onChange={(url) => {
              setUploaded(url);
              load();
            }}
            label="Upload to media library"
          />
        </section>
      )}
      {draft ? (
        <section className="admin-panel editor-panel">
          {resource !== "settings" && (
            <button
              className="text-link back-button"
              onClick={() => setDraft(null)}
            >
              <ArrowLeft size={16} />
              Back to {names[resource].toLowerCase()}
            </button>
          )}
          <h2>
            {resource === "pages"
              ? label(draft.key) + " page"
              : resource === "settings"
                ? "BUSINESS & WEBSITE SETTINGS"
                : draft.title || draft.name || "NEW SERVICE"}
          </h2>
          <form onSubmit={save}>
            {submission ? (
              <>
                <dl className="record-details">
                  {Object.entries(draft)
                    .filter(
                      ([k]) => !["_id", "__v", "notes", "status"].includes(k),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{label(key)}</dt>
                        <dd>{String(value || "-")}</dd>
                      </div>
                    ))}
                </dl>
                <label className="field">
                  Status
                  <select
                    value={draft.status}
                    onChange={(e) => update("status", e.target.value)}
                  >
                    {statuses.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Internal notes
                  <textarea
                    rows={5}
                    value={draft.notes || ""}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </label>
              </>
            ) : (
              <div className="editor-fields">
                {Object.entries(
                  resource === "pages" || resource === "settings"
                    ? draft.data
                    : draft,
                ).map(([key, value]) => editField(key, value))}
              </div>
            )}
            <div className="editor-actions">
              <button className="button" disabled={saving || uploading}>
                {saving ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Saving..." : "Save changes"}
              </button>
              {draft._id && (
                <button
                  className="small-button danger"
                  type="button"
                  disabled={saving || uploading}
                  onClick={() => remove(draft)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        <>
          {!["pages", "media"].includes(resource) && (
            <div className="admin-filters">
              <label className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search records"
                  aria-label="Search records"
                />
              </label>
              {submission && (
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter status"
                >
                  <option value="">All statuses</option>
                  {statuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {busy ? (
            <div className="empty-state" role="status">
              <LoaderCircle className="spin" />
              Loading...
            </div>
          ) : resource === "media" ? (
            <div className="media-grid">
              {rows.map((row) => {
                const url = `/api/uploads/${row.folder}/${row.filename}`;
                return (
                  <article className="media-card" key={row._id}>
                    <div className="media-image">
                      <SafeImage src={url} alt={row.filename} sizes="250px" />
                    </div>
                    <strong>{row.folder}</strong>
                    <small>{row.filename}</small>
                    <small>
                      {(row.size / 1024).toFixed(1)} KB Â /{" "}
                      {new Date(row.createdAt).toLocaleDateString()}
                    </small>
                    <div>
                      <button
                        className="small-button"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(url)
                            .then(() => toast.success("URL copied."))
                            .catch(() => toast.error("Could not copy."))
                        }
                      >
                        <Copy size={14} />
                        Copy URL
                      </button>
                      <button
                        className="small-button danger"
                        disabled={saving || uploading}
                        aria-label="Delete image"
                        onClick={() => remove(row)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : resource === "pages" ? (
            <div className="page-cards">
              {rows.map((row) => (
                <button
                  className="admin-panel page-card"
                  key={row.key}
                  onClick={() => setDraft(structuredClone(row))}
                >
                  <span className="eyebrow">PUBLIC PAGE</span>
                  <h2>{label(row.key)}</h2>
                  <p>Edit content, images and SEO settings.</p>
                  <span className="text-link">Edit page</span>
                </button>
              ))}
            </div>
          ) : rows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      {resource === "services" ? "Service" : "Name / Reference"}
                    </th>
                    <th>{resource === "services" ? "Order" : "Service"}</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id}>
                      <td>
                        <strong>{row.title || row.name}</strong>
                        <small>{row.reference || row.slug}</small>
                      </td>
                      <td>
                        {resource === "services" ? row.order : row.service}
                      </td>
                      <td>
                        <span className="badge">
                          {resource === "services"
                            ? row.published
                              ? "Published"
                              : "Draft"
                            : row.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="small-button"
                          onClick={() => setDraft(structuredClone(row))}
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No records yet</h3>
              <p>
                {resource === "services"
                  ? "Run the seed command or add your first service."
                  : "New records will appear here."}
              </p>
            </div>
          )}
          {total > 50 && (
            <div className="pagination">
              <button
                className="small-button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} / {Math.ceil(total / 50)}
              </span>
              <button
                className="small-button"
                disabled={page * 50 >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
