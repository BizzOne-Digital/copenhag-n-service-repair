import { z } from "zod";
const text = (min = 1, max = 300) => z.string().trim().min(min).max(max);
export const enquirySchema = z.object({
  name: text(2, 100),
  email: z.string().trim().email().max(254),
  phone: text(7, 40),
  company: z.string().trim().max(150).default(""),
  service: text(1, 200),
  message: text(10, 5000),
  website: z.string().max(0).optional(),
});
export const bookingSchema = enquirySchema.extend({
  equipment: text(2, 150),
  makeModel: z.string().trim().max(150).default(""),
  location: text(3, 300),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => {
      const d = new Date(v + "T12:00:00Z");
      return (
        !Number.isNaN(d.getTime()) &&
        d.toISOString().slice(0, 10) === v &&
        v >= torontoDate()
      );
    }, "Choose a valid current or future date."),
  timeWindow: z.enum(["Morning", "Afternoon", "Flexible"]),
  urgency: z.enum(["Routine", "Soon", "Breakdown"]),
});
export function torontoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export const serviceSchema = z.object({
  title: text(2, 150),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  summary: text(5, 500),
  description: text(10, 5000),
  image: z.string().max(2000),
  imageAlt: text(1, 200),
  pricingNote: text(1, 200),
  cta: text(1, 80),
  order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});
export function validImageURL(v: string) {
  return (
    !v ||
    v === "/images/brand/copenhagen-logo.png" ||
    /^\/images\/generated\/[a-z-]+\.webp$/.test(v) ||
    /^\/api\/uploads\/(products|gallery|pages|misc)\/\d+-[a-f0-9]+\.(jpg|png|webp|gif)$/.test(
      v,
    ) ||
    /^https:\/\/images\.unsplash\.com\//.test(v)
  );
}
