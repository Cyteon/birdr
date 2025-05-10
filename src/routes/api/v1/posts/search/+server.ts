import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";
import Relation from "$lib/models/Relation";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function GET({ request, url }) {
  let search = url.searchParams.get("q");

  if (!search) {
    return Response.json(
      { message: "No search query provided" },
      { status: 400 },
    );
  }

  let filter = { content: { $regex: search, $options: "i" } };

  let user = null;

  if (request.headers.get("Authorization") || request.headers.get("cookie")) {
    user = await verifyRequest(request);

    if (user) {
      const blockedIds = await Relation.find({
        userId: user._id,
        relation: 2,
      })
        .select("targetId")
        .lean();

      filter.authorId = { $nin: blockedIds.map((b) => b.targetId) };
    }
  }

  let posts = await Post.find(filter)
    .populate("mentions", "displayName")
    .populate("authorId", "username displayName avatarUrl staff verified")
    .limit(50)
    .sort({ postedAt: -1 })
    .lean();

  let commentCount = await Comment.aggregate([
    { $match: { postId: { $in: posts.map((p) => p._id) } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  return Response.json(
    posts.map((post) => {
      post.commentCount =
        commentCount.find((c) => c._id.toString() === post._id.toString())
          ?.count || 0;

      post.likeCount = post.likeUserIds?.length || 0;
      post.dislikeCount = post.dislikeUserIds?.length || 0;

      if (user) {
        post.hasLiked =
          post.likeUserIds?.some((id) => id.equals(user._id)) || false;
        post.hasDisliked =
          post.dislikeUserIds?.some((id) => id.equals(user._id)) || false;
      }

      post.likeUserIds = undefined;
      post.dislikeUserIds = undefined;

      return post;
    }),
  );
}
