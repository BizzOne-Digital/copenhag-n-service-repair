import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { AdminSession, RateLimit } from "@/models";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function hash(value: string) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
    throw new HttpError(503, "Admin authentication is not configured.");
  return createHash("sha256")
    .update(value + process.env.SESSION_SECRET)
    .digest("hex");
}
export function originCheck(req: Request) {
  const origin = req.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || req.url).origin;
  if (origin !== expected)
    throw new HttpError(403, "Request origin is not allowed.");
}
export async function admin() {
  const token = (await cookies()).get("csr_session")?.value;
  if (!token) throw new HttpError(401, "Please sign in.");
  await connectDB();
  const session = await AdminSession.findOne({
    tokenHash: hash(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!session) throw new HttpError(401, "Session expired. Please sign in.");
  return String((session as any).adminId);
}
export async function mutation(req: Request) {
  originCheck(req);
  return admin();
}
export async function rateLimit(req: Request, scope: string, max = 8) {
  await connectDB();
  const address =
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "local";
  const window = Math.floor(Date.now() / 600000);
  const key = createHash("sha256")
    .update(scope + address + window)
    .digest("hex");
  const item = await RateLimit.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(Date.now() + 1200000) },
    },
    { upsert: true, new: true },
  );
  if (item.count > max)
    throw new HttpError(
      429,
      "Too many requests. Please try again in a few minutes.",
    );
}
export function reference(prefix: string) {
  return prefix + "-" + randomBytes(5).toString("hex").toUpperCase();
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json(
      { success: false, error: error.message },
      { status: error.status },
    );
  if ((error as any)?.name === "ZodError")
    return Response.json(
      {
        success: false,
        error: "Please check the highlighted fields.",
        fields: (error as any).flatten().fieldErrors,
      },
      { status: 400 },
    );
  console.error(error instanceof Error ? error.message : "Request failed");
  return Response.json(
    {
      success: false,
      error:
        "Unable to complete this request. Please try again or call 519-281-6100.",
    },
    { status: 503 },
  );
}
