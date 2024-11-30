import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";

export async function DELETE({ request, params }) {
  // ⚠️ Restricted Endpoint ⚠️ (unless you're the post author)

  let postId = params.slug;

  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let post = await Post.findById(postId);

  if (!post) {
    return Response.json({ message: "Post not found" }, { status: 404 });
  }

  if (post.authorId.toString() !== user._id.toString() && !user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  await Post.findByIdAndDelete(postId);

  return Response.json({ message: "Success" });
}

export async function GET({ params }) {
  let postId = params.slug;

  let post = await Post.findById(postId).populate(
    "authorId",
    "username displayName avatarUrl staff",
  );

  if (!post) {
    return Response.json({ message: "Post not found" }, { status: 404 });
  }

  return Response.json(post);
}
