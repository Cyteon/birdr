import User from "$lib/models/User";
import Relation from "$lib/models/Relation";
import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function GET({ request }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  let users = await User.find({}, { password: 0 }).lean();

  const postCounts = await Post.aggregate([
    { $group: { _id: "$authorId", count: { $sum: 1 } } },
  ]);

  const commentCounts = await Comment.aggregate([
    { $group: { _id: "$authorId", count: { $sum: 1 } } },
  ]);

  const followingCounts = await Relation.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);

  const followerCounts = await Relation.aggregate([
    { $group: { _id: "$targetId", count: { $sum: 1 } } },
  ]);

  users = users.map((user) => {
    const postCount =
      postCounts.find((post) => post._id.toString() === user._id.toString())
        ?.count || 0;
    const commentCount =
      commentCounts.find(
        (comment) => comment._id.toString() === user._id.toString(),
      )?.count || 0;
    const followingCount =
      followingCounts.find(
        (follow) => follow._id.toString() === user._id.toString(),
      )?.count || 0;
    const followerCount =
      followerCounts.find(
        (follow) => follow._id.toString() === user._id.toString(),
      )?.count || 0;

    return {
      ...user,
      postCount,
      commentCount,
      followingCount,
      followerCount,
    };
  });

  return Response.json(users);
}
