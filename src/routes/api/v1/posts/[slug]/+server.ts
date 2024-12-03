import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";

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
  await Comment.deleteMany({ postId });

  return Response.json({ message: "Success" });
}

export async function GET({ params }) {
  let postId = params.slug;

  let post = await Post.findById(postId)
    .populate(
      "authorId",
      "username displayName avatarUrl staff verified otherBadges",
    )
    .populate("mentions", "displayName")
    .lean();

  if (!post) {
    return Response.json({ message: "Post not found" }, { status: 404 });
  }

  post.likeCount = post.likeUserIds?.length || 0;
  post.dislikeCount = post.dislikeUserIds?.length || 0;
  post.hasLiked = post.likeUserIds?.includes(user._id) || false;
  post.hasDisliked = post.dislikeUserIds?.includes(user._id) || false;
        
  post.likeUserIds = undefined;
  post.dislikeUserIds = undefined;

  let comments = await Comment.find({ postId })
    .populate(
      "authorId",
      "username displayName avatarUrl staff verified otherBadges",
    )
    .populate("mentions", "displayName")
    .sort({ postedAt: -1 })
    .lean();

  if (!comments) {
    comments = [];
  }

  return Response.json({
    comments,
    ...post,
  });
}
