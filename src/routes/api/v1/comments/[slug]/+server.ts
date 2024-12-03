import Comment from "$lib/models/Comment";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function DELETE({ params, request }) {
  // ⚠️ Restricted Endpoint ⚠️ (unless you're the post author)

  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const slug = params.slug;

  const comment = await Comment.findById(slug);

  if (!comment) {
    return Response.json({ message: "Comment not found" }, { status: 404 });
  }

  if (comment.authorId.toString() !== user._id.toString() && !user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  await Comment.findByIdAndDelete(slug);

  return Response.json({ message: "Success" });
}
