import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingSchema,
  enquirySchema,
  torontoDate,
  validImageURL,
} from "../lib/validation";
import {
  signature,
  folderCheck,
  parseUploadURL,
  uploadName,
} from "../lib/uploads";
const enquiry = {
  name: "Claude Test",
  email: "test@example.com",
  phone: "5192816100",
  company: "",
  service: "Lift Truck Service & Repair",
  message: "Equipment needs a service.",
  website: "",
};
test("enquiry rejects invalid email and honeypot", () => {
  assert.equal(enquirySchema.safeParse(enquiry).success, true);
  assert.equal(
    enquirySchema.safeParse({ ...enquiry, email: "bad" }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({ ...enquiry, website: "spam" }).success,
    false,
  );
});
test("booking rejects impossible dates and past dates", () => {
  const input = {
    ...enquiry,
    equipment: "Forklift",
    location: "Ontario",
    makeModel: "",
    timeWindow: "Flexible",
    urgency: "Routine",
  };
  assert.equal(
    bookingSchema.safeParse({ ...input, date: "2026-02-30" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...input, date: "2000-01-01" }).success,
    false,
  );
  assert.equal(
    bookingSchema.safeParse({ ...input, date: torontoDate() }).success,
    true,
  );
});
test("upload paths reject traversal and external URLs", () => {
  const name = uploadName("png");
  assert.ok(parseUploadURL("/api/uploads/pages/" + name));
  assert.equal(parseUploadURL("/api/uploads/pages/../secret"), null);
  assert.equal(parseUploadURL("/api/uploads/pages/a/b.png"), null);
  assert.equal(
    parseUploadURL("https://evil.test/api/uploads/pages/" + name),
    null,
  );
  assert.throws(() => folderCheck("../public"));
  assert.equal(validImageURL("javascript:alert(1)"), false);
});
test("signature checks reject SVG and unknown bytes", () => {
  assert.equal(
    signature(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])).mime,
    "image/png",
  );
  assert.equal(signature(Buffer.from("GIF89a")).mime, "image/gif");
  assert.throws(() => signature(Buffer.from("<svg/>")));
  assert.throws(() => signature(Buffer.from("not an image")));
});
import { escapeSearch } from "../lib/search";
test("search treats metacharacters as literal text", () => {
  for (const text of ["[", ".*", "a+b", "(test)", "a\\b"])
    assert.equal(new RegExp(escapeSearch(text)).test(text), true);
});
