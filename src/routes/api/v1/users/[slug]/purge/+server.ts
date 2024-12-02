import User from "$lib/models/User";
import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function POST({ request, params }) {
  // ⚠️ Restricted Endpoint ⚠️

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

  await Post.deleteMany({ authorId: target._id });
  await Comment.deleteMany({ authorId: target._id });

  return Response.json({ message: "Success" });
}
