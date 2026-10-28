import { randomBytes } from "node:crypto";
import { StoredUpload, PageContent, SiteSettings, Service } from "@/models";
import { HttpError } from "@/lib/security";
export const MAX_SIZE = 8 * 1024 * 1024;
export const CHUNK_SIZE = 1024 * 1024;
export const folders = ["products", "gallery", "pages", "misc"];
export function folderCheck(folder: string) {
  if (!folders.includes(folder))
    throw new HttpError(400, "Invalid upload folder.");
  return folder;
}
export function signature(data: Buffer) {
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return { mime: "image/png", ext: "png" };
  if (data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255)
    return { mime: "image/jpeg", ext: "jpg" };
  if (
    data.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(data.subarray(0, 6).toString())
  )
    return { mime: "image/gif", ext: "gif" };
  if (
    data.length >= 12 &&
    data.subarray(0, 4).toString() === "RIFF" &&
    data.subarray(8, 12).toString() === "WEBP"
  )
    return { mime: "image/webp", ext: "webp" };
  throw new HttpError(
    400,
    "The file is not a supported PNG, JPEG, WebP or GIF image.",
  );
}
export function uploadName(ext: string) {
  return `${Date.now()}-${randomBytes(16).toString("hex")}.${ext}`;
}
export async function saveUpload(
  data: Buffer,
  folder: string,
  mime: string,
  ownerId: string,
  filename?: string,
) {
  folderCheck(folder);
  if (!data.length || data.length > MAX_SIZE)
    throw new HttpError(400, "Choose an image between 1 byte and 8MB.");
  const type = signature(data);
  if (type.mime !== mime)
    throw new HttpError(400, "Image type does not match its contents.");
  filename = filename || uploadName(type.ext);
  await StoredUpload.updateOne(
    { folder, filename },
    {
      $setOnInsert: {
        folder,
        filename,
        mimeType: type.mime,
        size: data.length,
        data,
        ownerId,
      },
    },
    { upsert: true },
  );
  return {
    success: true,
    url: `/api/uploads/${folder}/${filename}`,
    filename,
    size: data.length,
    folder,
  };
}
export function parseUploadURL(url: string) {
  const match =
    /^\/api\/uploads\/(products|gallery|pages|misc)\/(\d+-[a-f0-9]{32}\.(?:jpg|png|webp|gif))$/.exec(
      url,
    );
  return match ? { folder: match[1], filename: match[2] } : null;
}
function contains(value: unknown, url: string): boolean {
  if (typeof value === "string") return value === url;
  if (Array.isArray(value)) return value.some((x) => contains(x, url));
  if (value && typeof value === "object")
    return Object.values(value).some((x) => contains(x, url));
  return false;
}
export async function referenced(url: string) {
  const [pages, settings, service] = await Promise.all([
    PageContent.find().lean(),
    SiteSettings.find().lean(),
    Service.findOne({ image: url }).lean(),
  ]);
  return (
    !!service ||
    pages.some((x) => contains(x.data, url)) ||
    settings.some((x) => contains(x.data, url))
  );
}
export async function deleteIfUnused(url: string) {
  const query = parseUploadURL(url);
  if (!query) return false;
  if (await referenced(url)) return false;
  await StoredUpload.deleteOne(query);
  return true;
}
export function imageURLs(value: unknown): string[] {
  if (typeof value === "string") return parseUploadURL(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(imageURLs);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(imageURLs);
  return [];
}
