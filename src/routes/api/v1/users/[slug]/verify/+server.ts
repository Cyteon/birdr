import User from "$lib/models/User";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function POST({ request, params }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  let slug = params.slug;

  let target = await User.findOne({ username: slug });

  if (!target) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  target.verified = true;
  await target.save();

  return Response.json({ message: "Success" });
}

export async function DELETE({ request, params }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  let slug = params.slug;

  let target = await User.findOne({ username: slug });

  if (!target) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  target.verified = false;
  await target.save();

  return Response.json({ message: "Success" });
}
