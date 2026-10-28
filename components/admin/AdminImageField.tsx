"use client";
import { useRef, useState } from "react";
import { Upload, Trash2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
export type UploadFolder = "products" | "gallery" | "pages" | "misc";
async function response(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data;
}
export async function uploadFile(
  file: File,
  folder: UploadFolder,
  onProgress: (n: number) => void,
) {
  if (
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
  )
    throw new Error("Choose a PNG, JPEG, WebP or GIF.");
  if (file.size === 0 || file.size > 8 * 1024 * 1024)
    throw new Error("The image must be between 1 byte and 8MB.");
  if (file.size <= 3 * 1024 * 1024) {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    const data = await response(
      await fetch("/api/upload", { method: "POST", body: form }),
    );
    onProgress(100);
    return data.url as string;
  }
  const session = await response(
    await fetch("/api/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, size: file.size, mimeType: file.type }),
    }),
  );
  try {
    const count = Math.ceil(file.size / session.chunkSize);
    for (let i = 0; i < count; i++) {
      const form = new FormData();
      form.set("id", session.id);
      form.set("index", String(i));
      form.set(
        "file",
        file.slice(i * session.chunkSize, (i + 1) * session.chunkSize),
        "chunk",
      );
      let success = false;
      let failure: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await response(
            await fetch("/api/upload/chunk", { method: "POST", body: form }),
          );
          success = true;
          break;
        } catch (error) {
          failure = error;
        }
      }
      if (!success) throw failure;
      onProgress(Math.round(((i + 1) / count) * 95));
    }
    const data = await response(
      await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id }),
      }),
    );
    onProgress(100);
    return data.url as string;
  } catch (error) {
    await fetch("/api/upload/session/" + session.id, {
      method: "DELETE",
    }).catch(() => {});
    throw error;
  }
}
export function AdminImageField({
  value,
  onChange,
  folder = "pages",
  label = "Image",
  onBusyChange,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  label?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  async function change(file?: File) {
    if (!file) return;
    setBusy(true);
    onBusyChange?.(true);
    setProgress(0);
    try {
      const url = await uploadFile(file, folder, setProgress);
      onChange(url);
      toast.success("Image uploaded. Save the content to apply it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      <div className="image-field-inner">
        <div className="upload-preview">
          <SafeImage src={value} alt={label} sizes="150px" />
        </div>
        <div className="upload-controls">
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            aria-label={label}
            disabled={busy}
            onChange={(e) => change(e.target.files?.[0])}
          />
          <button
            type="button"
            className="small-button"
            onClick={() => input.current?.click()}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Upload size={16} />
            )}
            {busy
              ? `Uploading ${progress}%`
              : value
                ? "Replace image"
                : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              className="small-button danger"
              disabled={busy}
              onClick={() => {
                onChange("");
                toast.success("Image removed from this draft. Save to apply.");
              }}
            >
              <Trash2 size={15} />
              Remove
            </button>
          )}
          <small>PNG, JPEG, WebP, GIF Â / Up to 8MB</small>
        </div>
      </div>
      <input
        aria-label={label + " URL"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded URL, generated image path or Unsplash URL"
        disabled={busy}
      />
    </div>
  );
}
