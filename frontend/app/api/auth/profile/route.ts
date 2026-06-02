import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok(user);
}
