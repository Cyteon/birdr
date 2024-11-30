import { verifyRequest } from "$lib/server/verifyRequest.server";
import Post from "$lib/models/Post";
import User from "$lib/models/User";

export async function PUT({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();

  let usersMentioned = content.match(/@(\w+)/g);
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

  return Response.json(post);
}

export async function GET({ url }) {
  let timeSort = url.searchParams.get("sort") === "asc" ? 1 : -1;
  let offset = parseInt(url.searchParams.get("offset")) || 0;

  const posts = await Post.find()
    .populate("authorId", "username displayName avatarUrl staff")
    .sort({ postedAt: timeSort })
    .skip(offset)
    .limit(20)
    .exec();

  return Response.json(posts);
}
