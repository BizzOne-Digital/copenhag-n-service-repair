import { escapeSearch } from "@/lib/search";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import {
  Booking,
  Enquiry,
  Service,
  PageContent,
  SiteSettings,
  StoredUpload,
} from "@/models";
import { admin, apiError, HttpError, mutation } from "@/lib/security";
import { defaultPages, defaultSettings } from "@/lib/defaults";
import { serviceSchema, validImageURL } from "@/lib/validation";
import {
  deleteIfUnused,
  imageURLs,
  parseUploadURL,
  referenced,
} from "@/lib/uploads";
export const runtime = "nodejs";
const resources: Record<string, any> = {
  bookings: Booking,
  enquiries: Enquiry,
  services: Service,
  pages: PageContent,
  settings: SiteSettings,
  media: StoredUpload,
};
function selected(resource: string) {
  const Model = resources[resource];
  if (!Model) throw new HttpError(404, "Not found.");
  return Model;
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    await admin();
    const { resource } = await params;
    const Model = selected(resource);
    const url = new URL(req.url);
    if (resource === "settings") {
      const item = await Model.findOne({ key: "main" }).lean();
      return Response.json({
        success: true,
        data: { ...defaultSettings, ...item?.data },
      });
    }
    if (resource === "pages") {
      const items = await Model.find().lean();
      return Response.json({
        success: true,
        data: Object.keys(defaultPages).map((key) => ({
          key,
          data: {
            ...defaultPages[key],
            ...items.find((x: any) => x.key === key)?.data,
          },
        })),
      });
    }
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const filter: Record<string, any> = {};
    const status = url.searchParams.get("status");
    if (status && ["bookings", "enquiries"].includes(resource))
      filter.status = status;
    const search = url.searchParams.get("search")?.slice(0, 100);
    if (search) {
      const escaped = escapeSearch(search);
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { reference: { $regex: escaped, $options: "i" } },
        { title: { $regex: escaped, $options: "i" } },
      ];
    }
    const data = await Model.find(filter)
      .sort(resource === "services" ? { order: 1 } : { createdAt: -1 })
      .skip((page - 1) * 50)
      .limit(50)
      .lean();
    return Response.json({
      success: true,
      data,
      total: await Model.countDocuments(filter),
      page,
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    await mutation(req);
    const { resource } = await params;
    selected(resource);
    const input = await req.json();
    if (resource === "services") {
      const data = serviceSchema.parse(input);
      if (!validImageURL(data.image))
        throw new HttpError(
          400,
          "Use an uploaded image, generated asset or Unsplash image.",
        );
      const item = await Service.create(data);
      return Response.json({ success: true, data: item });
    }
    throw new HttpError(405, "Creation is not allowed for this resource.");
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    await mutation(req);
    const { resource } = await params;
    const Model = selected(resource);
    const input = await req.json();
    let old: any;
    let updated: any;
    if (["pages", "settings"].includes(resource)) {
      const key =
        resource === "settings"
          ? "main"
          : z
              .enum(["home", "services", "about", "contact", "booking"])
              .parse(input.key);
      const defaults =
        resource === "settings" ? defaultSettings : defaultPages[key];
      const data = z
        .record(z.string(), z.string().max(10000))
        .parse(input.data);
      if (Object.keys(data).some((k) => !(k in defaults)))
        throw new HttpError(400, "Unknown content field.");
      for (const [k, v] of Object.entries(data)) {
        if (/image|logo/i.test(k) && !/alt/i.test(k) && !validImageURL(v))
          throw new HttpError(
            400,
            "Use an uploaded image, generated asset or Unsplash URL.",
          );
        if (
          k === "facebook" &&
          v &&
          !/^https:\/\/(www\.)?facebook\.com\//.test(v)
        )
          throw new HttpError(400, "Enter a valid Facebook page URL.");
        if (k === "email" && !z.string().email().safeParse(v).success)
          throw new HttpError(400, "Enter a valid email.");
      }
      old = await Model.findOne({ key }).lean();
      updated = await Model.findOneAndUpdate(
        { key },
        { $set: { data: { ...defaults, ...old?.data, ...data } } },
        { upsert: true, new: true },
      ).lean();
    } else {
      if (!isValidObjectId(input._id))
        throw new HttpError(400, "Invalid record.");
      old = await Model.findById(input._id).lean();
      if (!old) throw new HttpError(404, "Record not found.");
      let data;
      if (resource === "services") {
        data = serviceSchema.parse(input);
        if (!validImageURL(data.image))
          throw new HttpError(400, "Invalid image URL.");
      } else if (["bookings", "enquiries"].includes(resource)) {
        data = z
          .object({
            status:
              resource === "bookings"
                ? z.enum([
                    "New",
                    "Contacted",
                    "Confirmed",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                  ])
                : z.enum(["New", "Read", "Resolved"]),
            notes: z.string().max(10000),
          })
          .parse(input);
      } else throw new HttpError(405, "Update not allowed.");
      updated = await Model.findByIdAndUpdate(
        input._id,
        { $set: data },
        { new: true },
      ).lean();
    }
    for (const url of imageURLs(old)) {
      if (!imageURLs(updated).includes(url)) await deleteIfUnused(url);
    }
    return Response.json({ success: true, data: updated });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    await mutation(req);
    const { resource } = await params;
    const Model = selected(resource);
    if (!["bookings", "enquiries", "services", "media"].includes(resource))
      throw new HttpError(405, "Deletion not allowed.");
    const { id } = await req.json();
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid record.");
    const item = await Model.findById(id).lean();
    if (!item) throw new HttpError(404, "Record not found.");
    if (resource === "media") {
      const url = `/api/uploads/${item.folder}/${item.filename}`;
      if (!parseUploadURL(url) || (await referenced(url)))
        throw new HttpError(
          409,
          "This image is still used in website content. Replace it there first.",
        );
    }
    await Model.deleteOne({ _id: id });
    if (resource === "services")
      for (const url of imageURLs(item)) await deleteIfUnused(url);
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
