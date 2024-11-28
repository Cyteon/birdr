import User from "$lib/models/User";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function GET({ request }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  delete user.password;

  return Response.json(user);
}
