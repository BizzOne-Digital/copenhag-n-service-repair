import { compare } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { AdminUser, AdminSession } from "@/models";
import { connectDB } from "@/lib/db";
import {
  apiError,
  hash,
  HttpError,
  originCheck,
  rateLimit,
} from "@/lib/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    originCheck(req);
    await connectDB();
    await rateLimit(req, "login", 8);
    const { email, password } = z
      .object({
        email: z.string().email().max(254),
        password: z.string().min(1).max(200),
      })
      .parse(await req.json());
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    const valid = await compare(
      password,
      user?.passwordHash ||
        "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5P9.xL31W4QF1N5Mo8F3VZ9q8NL6Ydu",
    );
    if (!user || !valid)
      throw new HttpError(401, "Email or password is incorrect.");
    const token = randomBytes(32).toString("hex");
    await AdminSession.create({
      tokenHash: hash(token),
      adminId: user._id,
      expiresAt: new Date(Date.now() + 28800000),
    });
    (await cookies()).set("csr_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
