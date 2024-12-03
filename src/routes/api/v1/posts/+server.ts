import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";
import User from "$lib/models/User";
import Comment from "$lib/models/Comment";
import Relation from "$lib/models/Relation";
import ogs from "open-graph-scraper";

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

  let post = await Post.create({ content, authorId: user.id, mentions });

  getOGData(post).catch(console.error);

  return Response.json(post);
}

export async function GET({ request, url }) {
  const timeSort = url.searchParams.get("sort") === "asc" ? 1 : -1;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const limit = parseInt(url.searchParams.get("limit")) || 20;

  let filter = {}

  if (request.headers.get("Authorization") || request.headers.get("cookie")) {
    const following = url.searchParams.get("following");
    const user = await verifyRequest(request);

    if (user) {
      const blockedIds = await Relation.find({ userId: user._id, relation: 2 }).select("targetId").lean();
  
      filter.authorId = { $nin: blockedIds.map((b) => b.targetId) };

      if (following) {
        if (!user) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
    
        const followingIds = await Relation.find({ userId: user._id, relation: 1 }).select("targetId").lean();
    
        filter.authorId = { ...filter.authorId, $in: followingIds.map((f) => f.targetId) };
      }
    }
  }

  const posts = await Post.find(filter)
    .populate(
      "authorId",
      "username displayName avatarUrl staff verified otherBadges",
    )
    .populate("mentions", "displayName")
    .sort({ pinned: -1 })
    .sort({ postedAt: timeSort })
    .skip(offset)
    .limit(limit)
    .lean();

  const commentCounts = await Comment.aggregate([
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  return Response.json(
    posts.map((post) => {
      post.commentCount =
        commentCounts.find((c) => c._id.toString() === post._id.toString())
          ?.count || 0;
      return post;
    }),
  );
}
