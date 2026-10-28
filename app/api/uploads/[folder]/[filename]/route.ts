import { StoredUpload } from "@/models";
import { connectDB } from "@/lib/db";
import { parseUploadURL } from "@/lib/uploads";
import { apiError } from "@/lib/security";
export const runtime = "nodejs";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> },
) {
  try {
    const { folder, filename } = await params;
    const query = parseUploadURL(`/api/uploads/${folder}/${filename}`);
    if (!query) return new Response("Not found", { status: 404 });
    await connectDB();
    const doc = await StoredUpload.findOne(query).select("+data");
    if (!doc) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(doc.data);
    let offset = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        const end = Math.min(offset + 65536, bytes.length);
        controller.enqueue(new Uint8Array(bytes.subarray(offset, end)));
        offset = end;
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
