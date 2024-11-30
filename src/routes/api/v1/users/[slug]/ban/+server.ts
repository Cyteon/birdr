import User from "$lib/models/User";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function POST({ request, params }) {
  let user = await verifyRequest(request);

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  let username = params.slug;

  let target = await User.findOne({ username });

  if (!target) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  target.banned = true;

  await target.save();

  return Response.json({ message: "Success" });
}
