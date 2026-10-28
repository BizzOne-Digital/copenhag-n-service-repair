import { z } from "zod";
import { UploadSession } from "@/models";
import { apiError, mutation, rateLimit } from "@/lib/security";
import { MAX_SIZE, CHUNK_SIZE, folderCheck, uploadName } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const ownerId = await mutation(req);
    await rateLimit(req, "chunk-init", 30);
    const data = z
      .object({
        folder: z.string(),
        size: z.number().int().positive().max(MAX_SIZE),
        mimeType: z.enum([
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ]),
      })
      .parse(await req.json());
    folderCheck(data.folder);
    const ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    }[data.mimeType];
    const item = await UploadSession.create({
      ...data,
      ownerId,
      count: Math.ceil(data.size / CHUNK_SIZE),
      filename: uploadName(ext),
      expiresAt: new Date(Date.now() + 3600000),
    });
    return Response.json({
      success: true,
      id: String(item._id),
      chunkSize: CHUNK_SIZE,
    });
  } catch (e) {
    return apiError(e);
  }
}
