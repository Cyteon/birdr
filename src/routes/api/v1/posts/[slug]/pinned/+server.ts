import Post from "$lib/models/Post";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function POST({ request, params }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const slug = params.slug;

  const post = await Post.findById(slug);

  if (!post) {
    return Response.json({ message: "Post not found" }, { status: 404 });
  }

  post.pinned = true;
  await post.save();

  return Response.json({ message: "Post pinned" });
}

export async function DELETE({ request, params }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const slug = params.slug;

  const post = await Post.findById(slug);

  if (!post) {
    return Response.json({ message: "Post not found" }, { status: 404 });
  }

  post.pinned = false;
  await post.save();

  return Response.json({ message: "Post unpinned" });
}
