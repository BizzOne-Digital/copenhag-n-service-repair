import { isValidObjectId } from "mongoose";
import { UploadSession, UploadChunk } from "@/models";
import { apiError, HttpError, mutation } from "@/lib/security";
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ownerId = await mutation(req);
    const { id } = await params;
    if (!isValidObjectId(id)) throw new HttpError(400, "Invalid upload.");
    const deleted = await UploadSession.findOneAndDelete({
      _id: id,
      ownerId,
      state: "open",
    });
    if (deleted) await UploadChunk.deleteMany({ sessionId: id });
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
