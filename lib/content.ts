import "server-only";
import { connectDB } from "@/lib/db";
import { PageContent, Service, SiteSettings } from "@/models";
import {
  defaultPages,
  defaultServices,
  defaultSettings,
  type ServiceData,
} from "@/lib/defaults";
export async function settings() {
  if (!process.env.MONGODB_URI) return defaultSettings;
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  return { ...defaultSettings, ...(doc as any)?.data };
}
export async function pageContent(key: string) {
  if (!process.env.MONGODB_URI) return defaultPages[key] || {};
  await connectDB();
  const doc = await PageContent.findOne({ key }).lean();
  return { ...defaultPages[key], ...(doc as any)?.data } as Record<
    string,
    string
  >;
}
export async function services(): Promise<ServiceData[]> {
  if (!process.env.MONGODB_URI) return defaultServices;
  await connectDB();
  return JSON.parse(
    JSON.stringify(
      await Service.find({ published: true }).sort({ order: 1 }).lean(),
    ),
  );
}
export async function pageMetadata(key: string, path: string) {
  const p = await pageContent(key);
  const s = await settings();
  return {
    title: p.seoTitle || s.seoTitle,
    description: p.seoDescription || s.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      title: p.seoTitle || s.seoTitle,
      description: p.seoDescription || s.seoDescription,
      url: path,
    },
  };
}
