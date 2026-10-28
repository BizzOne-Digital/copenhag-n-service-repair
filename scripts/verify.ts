import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { hash } from "bcryptjs";
import { chromium } from "@playwright/test";
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
  Booking,
  Enquiry,
} from "../models";
import {
  defaultPages,
  defaultServices,
  defaultSettings,
  photos,
} from "../lib/defaults";
import { torontoDate } from "../lib/validation";
const origin = "http://localhost:3124";
let server: ReturnType<typeof spawn> | undefined;
let mongo: MongoMemoryServer | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
async function main() {
  mongo = await MongoMemoryServer.create();
  process.env.DATABASE_ENABLED = "true";
  process.env.MONGODB_URI = mongo.getUri("copenhagen_test");
  process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.NEXT_PUBLIC_SITE_URL = origin;
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
  const email = "verification@example.test";
  const password = randomBytes(20).toString("hex");
  await AdminUser.create({ email, passwordHash: await hash(password, 12) });
  await Service.insertMany(defaultServices);
  await PageContent.insertMany(
    Object.entries(defaultPages).map(([key, data]) => ({ key, data })),
  );
  await SiteSettings.create({ key: "main", data: defaultSettings });
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--port", "3124"],
    {
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  let logs = "";
  server.stderr?.on("data", (chunk) => {
    logs += String(chunk);
  });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try {
      const res = await fetch(origin + "/admin/login");
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.ok(
    ready,
    "Production server did not become ready: " + logs.slice(-2000),
  );
  for (const path of [
    "/",
    "/services",
    "/about",
    "/contact",
    "/booking",
    "/services/lift-truck-repair",
    "/admin/login",
    "/robots.txt",
    "/sitemap.xml",
  ])
    assert.equal((await fetch(origin + path)).status, 200, path);
  for (const url of new Set(Object.values(photos))) {
    const response = await fetch(origin + url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get("content-type"), "image/webp");
  }
  for (const route of ["/", "/about"]) {
    const html = await (await fetch(origin + route)).text();
    for (const label of [
      "30+ Years of Experience",
      "Licensed Technicians",
      "Factory-Trained Technician",
    ])
      assert.ok(html.includes(label), route + " missing " + label);
  }
  console.log("PASS generated WebP assets and client qualification copy");
  console.log("PASS public routes, SEO routes and service detail");
  let res = await fetch(origin + "/api/upload", {
    method: "POST",
    headers: { Origin: origin },
    body: new FormData(),
  });
  assert.equal(res.status, 401);
  res = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 403);
  res = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, await res.clone().text());
  const cookie = res.headers.get("set-cookie")!.split(";")[0];
  assert.ok(res.headers.get("set-cookie")?.includes("HttpOnly"));
  const headers = { Origin: origin, Cookie: cookie };
  async function json(path: string, data: any, method = "POST") {
    return fetch(origin + path, {
      method,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
  console.log(
    "PASS admin authentication, unauthorized uploads and origin checks",
  );
  const base = {
    name: "Verification Request",
    email: "client@example.test",
    phone: "5192816100",
    company: "Test",
    service: defaultServices[0].title,
    message: "Equipment service verification request.",
    website: "",
  };
  res = await json("/api/submissions/enquiries", base);
  assert.equal(res.status, 201);
  assert.equal(await Enquiry.countDocuments(), 1);
  res = await json("/api/submissions/bookings", {
    ...base,
    equipment: "Forklift",
    makeModel: "Test",
    location: "Ontario",
    date: torontoDate(),
    timeWindow: "Flexible",
    urgency: "Routine",
  });
  assert.equal(res.status, 201, await res.clone().text());
  assert.equal(await Booking.countDocuments(), 1);
  const booking = await Booking.findOne();
  res = await json(
    "/api/admin/bookings",
    {
      _id: String(booking!._id),
      status: "Contacted",
      notes: "Verification note",
    },
    "PATCH",
  );
  assert.equal(res.status, 200);
  assert.equal((await Booking.findById(booking!._id))!.status, "Contacted");
  console.log(
    "PASS contact and booking database persistence, admin status updates",
  );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
    "base64",
  );
  async function formUpload(bytes: Buffer, type: string, folder = "pages") {
    const form = new FormData();
    form.set("folder", folder);
    form.set("file", new Blob([new Uint8Array(bytes)], { type }), "test.png");
    return fetch(origin + "/api/upload", {
      method: "POST",
      headers,
      body: form,
    });
  }
  res = await formUpload(png, "image/png", "invalid");
  assert.equal(res.status, 400);
  res = await formUpload(Buffer.from("<svg/>"), "image/svg+xml");
  assert.equal(res.status, 400);
  res = await formUpload(png, "image/jpeg");
  assert.equal(res.status, 400);
  res = await formUpload(png, "image/png");
  assert.equal(res.status, 200, await res.clone().text());
  const uploaded = await res.json();
  res = await fetch(origin + uploaded.url);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/png");
  assert.ok(res.headers.get("cache-control")?.includes("immutable"));
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), png);
  res = await json(
    "/api/admin/pages",
    { key: "home", data: { heroImage: uploaded.url } },
    "PATCH",
  );
  assert.equal(res.status, 200);
  const first = await StoredUpload.findOne({ filename: uploaded.filename });
  res = await json("/api/admin/media", { id: String(first!._id) }, "DELETE");
  assert.equal(res.status, 409);
  res = await formUpload(png, "image/png");
  const replacement = await res.json();
  res = await json(
    "/api/admin/pages",
    { key: "home", data: { heroImage: replacement.url } },
    "PATCH",
  );
  assert.equal(res.status, 200);
  assert.equal(
    await StoredUpload.countDocuments({ filename: uploaded.filename }),
    0,
  );
  assert.equal(
    (await PageContent.findOne({ key: "home" }))!.data.heroImage,
    replacement.url,
  );
  res = await json(
    "/api/admin/pages",
    { key: "home", data: { heroImage: defaultPages.home.heroImage } },
    "PATCH",
  );
  assert.equal(res.status, 200);
  assert.equal(
    await StoredUpload.countDocuments({ filename: replacement.filename }),
    0,
  );
  console.log(
    "PASS image upload, validation, binary delivery, content URLs, safe replacement/deletion",
  );
  const large = Buffer.concat([png, randomBytes(5 * 1024 * 1024)]);
  res = await json("/api/upload/init", {
    folder: "gallery",
    size: large.length,
    mimeType: "image/png",
  });
  assert.equal(res.status, 200);
  const session = await res.json();
  for (let i = 0; i < Math.ceil(large.length / session.chunkSize); i++) {
    const form = new FormData();
    form.set("id", session.id);
    form.set("index", String(i));
    form.set(
      "file",
      new Blob([
        new Uint8Array(
          large.subarray(i * session.chunkSize, (i + 1) * session.chunkSize),
        ),
      ]),
      "chunk",
    );
    res = await fetch(origin + "/api/upload/chunk", {
      method: "POST",
      headers,
      body: form,
    });
    assert.equal(res.status, 200);
    if (i === 0) {
      res = await fetch(origin + "/api/upload/chunk", {
        method: "POST",
        headers,
        body: form,
      });
      assert.equal(res.status, 200);
    }
  }
  res = await json("/api/upload/complete", { id: session.id });
  assert.equal(res.status, 200, await res.clone().text());
  const completed = await res.json();
  res = await json("/api/upload/complete", { id: session.id });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).url, completed.url);
  assert.equal(await UploadChunk.countDocuments({ sessionId: session.id }), 0);
  res = await fetch(origin + completed.url);
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), large);
  res = await json("/api/upload/init", {
    folder: "pages",
    size: 8 * 1024 * 1024 + 1,
    mimeType: "image/png",
  });
  assert.equal(res.status, 400);
  console.log(
    "PASS large-file chunks, idempotent retries/finalization, exact binary roundtrip and max-size check",
  );
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "csr_session",
      value: cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await mkdir("test-results", { recursive: true });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin, { waitUntil: "networkidle" });
    assert.equal(
      await page.locator("h1").innerText(),
      "YOUR\nLIFT TRUCK\nSPECIALIST.",
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, "Homepage overflow at " + width);
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `test-results/home-${width}.png`,
        fullPage: true,
      });
    if (width === 390) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .locator("#main-navigation")
        .getByRole("link", { name: "Services", exact: true })
        .click();
      await page.waitForURL("**/services");
    }
  }
  for (const route of [
    "/services",
    "/about",
    "/contact",
    "/booking",
    "/admin",
    "/admin/bookings",
    "/admin/pages",
    "/admin/settings",
    "/admin/media",
  ]) {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(origin + route, { waitUntil: "networkidle" });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      route + " overflow",
    );
  }
  await page.goto(origin + "/admin/pages", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /home.*edit content/i }).click();
  await page.getByLabel("Hero Line1", { exact: true }).fill("YOUR");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Changes saved.", { exact: true }).waitFor();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + "/admin", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "test-results/admin-1440.png",
    fullPage: true,
  });
  await page.goto(origin + "/contact", { waitUntil: "networkidle" });
  await page.getByLabel(/Full name/).fill("Browser Verification");
  await page.getByLabel(/^Email/).fill("browser@example.test");
  await page.getByLabel(/^Phone/).fill("5192816100");
  await page
    .getByLabel(/Service of interest/)
    .selectOption(defaultServices[0].title);
  await page
    .getByLabel(/^Message/)
    .fill("A browser verification service enquiry.");
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await page.getByRole("heading", { name: /THANK YOU/ }).waitFor();
  assert.equal(await Enquiry.countDocuments(), 2);
  await page.goto(origin + "/admin/media", { waitUntil: "networkidle" });
  const countBefore = await StoredUpload.countDocuments();
  await page
    .getByLabel("Upload to media library", { exact: true })
    .setInputFiles({
      name: "browser-upload.png",
      mimeType: "image/png",
      buffer: large,
    });
  await page
    .getByText("Image uploaded. Save the content to apply it.", { exact: true })
    .waitFor({ timeout: 60000 });
  assert.equal(await StoredUpload.countDocuments(), countBefore + 1);
  console.log(
    "PASS browser contact form and admin large-file upload component",
  );
  assert.deepEqual(failures, [], "Browser runtime errors");
  console.log(
    "PASS responsive widths, mobile navigation, admin pages and content-save interaction",
  );
  console.log(
    "ALL INTEGRATION CHECKS PASSED. Temporary test database will be removed.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server?.kill();
    await mongoose.disconnect();
    await mongo?.stop();
  });
