import { hash as hashPassword } from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import {
  AdminUser,
  Service,
  PageContent,
  SiteSettings,
  StoredUpload,
  UploadSession,
  UploadChunk,
  RateLimit,
  AdminSession,
} from "../models";
import {
  defaultPages,
  defaultServices,
  defaultSettings,
} from "../lib/defaults";
async function main() {
  await connectDB();
  for (const Model of [
    AdminUser,
    Service,
    PageContent,
    SiteSettings,
    StoredUpload,
    UploadSession,
    UploadChunk,
    RateLimit,
    AdminSession,
  ])
    await Model.init();
  for (const service of defaultServices)
    await Service.updateOne(
      { slug: service.slug },
      { $setOnInsert: service },
      { upsert: true },
    );
  for (const [key, data] of Object.entries(defaultPages))
    await PageContent.updateOne(
      { key },
      { $setOnInsert: { key, data } },
      { upsert: true },
    );
  await SiteSettings.updateOne(
    { key: "main" },
    { $setOnInsert: { key: "main", data: defaultSettings } },
    { upsert: true },
  );
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12)
      throw new Error(
        "Initial admin password must have at least 12 characters.",
      );
    await AdminUser.updateOne(
      { email: process.env.ADMIN_EMAIL.toLowerCase() },
      {
        $setOnInsert: {
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          passwordHash: await hashPassword(process.env.ADMIN_PASSWORD, 12),
        },
      },
      { upsert: true },
    );
    console.log("Initial admin exists. Existing passwords were not changed.");
  } else
    console.log(
      "Content seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the initial admin.",
    );
  console.log("Seed complete. Existing content was preserved.");
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
