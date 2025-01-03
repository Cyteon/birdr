import User, { type UserType } from "$lib/models/User";
import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";
import UsernameRedirect from "$lib/models/UsernameRedirect";
import { verifyRequest } from "$lib/server/verifyRequest.server";
import Relation from "$lib/models/Relation";

export async function GET({ params, request }) {
  let username = params.slug;

  let user = await User.findOne({ username }).lean();

  if (!user) {
    let redir = await UsernameRedirect.findOne({ from: username });

    if (redir) {
      return Response.json({ location: `/@${redir.to}` }, { status: 307 });
    }

    return Response.json({ message: "User not found" }, { status: 404 });
  }

  let posts = await Post.find({ authorId: user._id })
    .populate("mentions", "displayName")
    .limit(50)
    .sort({ postedAt: -1 });

  let commentCount = await Comment.aggregate([
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  const followingCount = await Relation.countDocuments({
    userId: user._id,
  }).lean();

  const followerCount = await Relation.countDocuments({
    targetId: user._id,
    relation: 1,
  }).lean();

  let isFollowing = undefined;
  let isBlocked = undefined;

  let me = null;

  if (request.headers.get("Authorization") || request.headers.get("cookie")) {
    me = await verifyRequest(request);

    if (me) {
      let relation = await Relation.findOne({
        userId: me._id,
        targetId: user._id,
      }).lean();

      if (relation && relation.relation === 1) {
        isFollowing = true;
      } else if (relation && relation.relation === 2) {
        isBlocked = true;
      }
    }
  }

  return Response.json({
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    banned: user.banned,
    otherBadges: user.otherBadges,
    staff: user.staff,
    verified: user.verified,
    followingCount,
    followerCount,
    isFollowing,
    isBlocked,
    posts: posts.map((post) => {
      post = post._doc;

      post.commentCount =
        commentCount.find((c) => c._id.toString() === post._id.toString())
          ?.count || 0;

      post.likeCount = post.likeUserIds?.length || 0;
      post.dislikeCount = post.dislikeUserIds?.length || 0;

      if (me) {
        post.hasLiked =
          post.likeUserIds?.some((id) => id.equals(me._id)) || false;
        post.hasDisliked =
          post.dislikeUserIds?.some((id) => id.equals(me._id)) || false;
      }

      post.likeUserIds = undefined;
      post.dislikeUserIds = undefined;

      return post;
    }),
  });
}
