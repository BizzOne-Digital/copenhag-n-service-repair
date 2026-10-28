import { cookies } from "next/headers";
import { AdminSession } from "@/models";
import { apiError, hash, mutation } from "@/lib/security";
export async function POST(req: Request) {
  try {
    await mutation(req);
    const jar = await cookies();
    const token = jar.get("csr_session")?.value;
    if (token) await AdminSession.deleteOne({ tokenHash: hash(token) });
    jar.delete("csr_session");
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
