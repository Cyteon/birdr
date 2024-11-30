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

export async function PATCH({ request }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let { displayName } = await request.json();

  if (displayName) {
    user.displayName = displayName;
  }

  await user.save();

  return Response.json(user);
}
