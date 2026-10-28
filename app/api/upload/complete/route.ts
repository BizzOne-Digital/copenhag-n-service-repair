import { isValidObjectId } from "mongoose";
import { UploadSession, UploadChunk } from "@/models";
import { apiError, HttpError, mutation } from "@/lib/security";
import { MAX_SIZE, saveUpload } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(req: Request) {
  let lockedId: string | undefined;
  try {
    const ownerId = await mutation(req);
    const { id } = await req.json();
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid upload.");
    const previous = await UploadSession.findOne({
      _id: id,
      ownerId,
      expiresAt: { $gt: new Date() },
    });
    if (previous?.state === "complete") return Response.json(previous.result);
    const session = await UploadSession.findOneAndUpdate(
      { _id: id, ownerId, state: "open", expiresAt: { $gt: new Date() } },
      { $set: { state: "finalizing" } },
      { new: true },
    );
    if (!session)
      throw new HttpError(409, "Upload is unavailable or already finalizing.");
    lockedId = id;
    const chunks = await UploadChunk.find({ sessionId: id }).sort({ index: 1 });
    if (chunks.length !== session.count || chunks.some((c, i) => c.index !== i))
      throw new HttpError(400, "Upload is incomplete.");
    const size = chunks.reduce((n, c) => n + c.size, 0);
    if (size !== session.size || size > MAX_SIZE)
      throw new HttpError(400, "Upload size mismatch.");
    const data = Buffer.concat(chunks.map((c) => Buffer.from(c.data)));
    const result = await saveUpload(
      data,
      session.folder,
      session.mimeType,
      ownerId,
      session.filename,
    );
    await UploadSession.updateOne(
      { _id: id },
      { $set: { state: "complete", result } },
    );
    lockedId = undefined;
    await UploadChunk.deleteMany({ sessionId: id });
    return Response.json(result);
  } catch (e) {
    if (lockedId)
      await UploadSession.updateOne(
        { _id: lockedId, state: "finalizing" },
        { $set: { state: "open" } },
      );
    return apiError(e);
  }
}
