import { isValidObjectId } from "mongoose";
import { UploadChunk, UploadSession } from "@/models";
import { apiError, HttpError, mutation } from "@/lib/security";
import { CHUNK_SIZE } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const ownerId = await mutation(req);
    const form = await req.formData();
    const id = String(form.get("id"));
    const index = Number(form.get("index"));
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid upload.");
    const session = await UploadSession.findOne({
      _id: id,
      ownerId,
      state: "open",
      expiresAt: { $gt: new Date() },
    });
    if (!session) throw new HttpError(404, "Upload session expired.");
    if (!Number.isInteger(index) || index < 0 || index >= session.count)
      throw new HttpError(400, "Invalid chunk index.");
    const file = form.get("file");
    const expected =
      index === session.count - 1
        ? session.size - index * CHUNK_SIZE
        : CHUNK_SIZE;
    if (!(file instanceof File) || file.size !== expected)
      throw new HttpError(400, "Invalid chunk size.");
    const data = Buffer.from(await file.arrayBuffer());
    await UploadChunk.updateOne(
      { sessionId: id, index },
      {
        $setOnInsert: {
          sessionId: id,
          index,
          data,
          size: data.length,
          expiresAt: session.expiresAt,
        },
      },
      { upsert: true },
    );
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
