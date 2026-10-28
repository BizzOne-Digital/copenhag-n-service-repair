import { apiError, HttpError, mutation, rateLimit } from "@/lib/security";
import { saveUpload } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const owner = await mutation(req);
    await rateLimit(req, "upload", 60);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Choose an image.");
    return Response.json(
      await saveUpload(
        Buffer.from(await file.arrayBuffer()),
        String(form.get("folder")),
        file.type,
        owner,
      ),
    );
  } catch (e) {
    return apiError(e);
  }
}
