import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";
import User from "$lib/models/User";
import Comment from "$lib/models/Comment";
import Relation from "$lib/models/Relation";
import ogs from "open-graph-scraper";
import moderate from "$lib/server/contentModerator.server";

async function getOGData(post) {
  const links = post.content.match(/https?:\/\/[^\s]+/g);
  let ogData = {};

  if (!links) return;

  for (let link of links) {
    try {
      const { result } = await ogs({ url: link });

      if (result.success) {
        let linkOk = link.replaceAll(".", "_-_");

        ogData[linkOk] = result;
      }
    } catch {}
  }

  post.ogData = ogData;
  await post.save();
}

export async function PUT({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  if (!content) {
    return Response.json({ message: "Content missing" }, { status: 400 });
  }

  if (content.length > 4000) {
    return Response.json({ message: "Content too long" }, { status: 400 });
  }

  let usersMentioned = content.match(/(?<=^|\s)@(\w+)(?=\s|$)/g);
  let mentions = {};

  if (usersMentioned) {
    let usersData = await User.find({
      username: { $in: usersMentioned.map((u) => u.slice(1)) },
    });

    mentions = usersData.reduce((acc, user) => {
      acc[`@${user.username}`] = user.id;
      return acc;
    }, {});
  }

  let post = await Post.create({ content, authorId: user._id, mentions });

  Promise.all([getOGData(post), moderate(post)]);

  return Response.json(post);
}

export async function GET({ request, url }) {
  const sort = url.searchParams.get("sort") || "desc";
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const limit = parseInt(url.searchParams.get("limit")) || 20;

  let user = null;
  let filter = {};

  if (request.headers.get("Authorization") || request.headers.get("cookie")) {
    const following = url.searchParams.get("following");
    user = await verifyRequest(request);

    if (user) {
      const blockedIds = await Relation.find({ userId: user._id, relation: 2 })
        .select("targetId")
        .lean();

      filter.authorId = { $nin: blockedIds.map((b) => b.targetId) };

      if (following) {
        if (!user) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const followingIds = await Relation.find({
          userId: user._id,
          relation: 1,
        })
          .select("targetId")
          .lean();

        filter.authorId = {
          ...filter.authorId,
          $in: followingIds.map((f) => f.targetId),
        };
      }
    }
  }

  let sort2 = {};

  if (sort === "asc") {
    sort2 = { postedAt: 1 };
  } else if (sort === "desc") {
    sort2 = { postedAt: -1 };
  } else if (sort === "top") {
    sort2 = {
      likeDislikeDifference: -1,
    };
  }

  const posts = await Post.find(filter)
    .populate(
      "authorId",
      "username displayName avatarUrl staff verified otherBadges",
    )
    .populate("mentions", "displayName")
    .sort({ pinned: -1 })
    .sort(sort2)
    .skip(offset)
    .limit(limit);

  const commentCounts = await Comment.aggregate([
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  return Response.json(
    posts.map((post) => {
      post = post._doc;

      post.commentCount =
        commentCounts.find((c) => c._id.toString() === post._id.toString())
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
