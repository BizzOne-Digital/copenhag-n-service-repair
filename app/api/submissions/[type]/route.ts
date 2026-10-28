import { Booking, Enquiry } from "@/models";
import { connectDB } from "@/lib/db";
import { bookingSchema, enquirySchema } from "@/lib/validation";
import {
  apiError,
  HttpError,
  originCheck,
  rateLimit,
  reference,
} from "@/lib/security";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    originCheck(req);
    if (Number(req.headers.get("content-length")) > 20000)
      throw new HttpError(413, "Request too large.");
    const { type } = await params;
    if (!["bookings", "enquiries"].includes(type))
      throw new HttpError(404, "Not found.");
    await connectDB();
    await rateLimit(req, "submission", 6);
    const input = await req.json();
    const data =
      type === "bookings"
        ? bookingSchema.parse(input)
        : enquirySchema.parse(input);
    const { website, ...record } = data;
    const ref = reference(type === "bookings" ? "CSR" : "ENQ");
    await (type === "bookings" ? Booking : Enquiry).create({
      ...record,
      reference: ref,
      status: "New",
    });
    return Response.json({ success: true, reference: ref }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
