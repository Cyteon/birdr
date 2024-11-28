import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";

export async function PUT({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  let post = await Post.create({ content, authorId: user.id });

  return Response.json(post);
}

export async function GET({}) {
  const posts = await Post.find()
    .populate("authorId", "username displayName avatarUrl")
    .sort({ postedAt: -1 })
    .limit(20)
    .exec();

  return Response.json(posts);
}
