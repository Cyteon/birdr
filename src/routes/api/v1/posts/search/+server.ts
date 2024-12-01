import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";

export async function GET({ url }) {
  let search = url.searchParams.get("q");

  if (!search) {
    return Response.json({ message: "No search query provided" }, { status: 400 });
  }

  let posts = await Post.find({ content: { $regex: search, $options: "i" } })
    .populate("mentions", "displayName")
    .populate("authorId", "username displayName avatarUrl staff verified")
    .limit(50)
    .sort({ postedAt: -1 });

  let commentCount = await Comment.aggregate([
    { $match: { postId: { $in: posts.map((p) => p._id) } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  return Response.json(
    posts.map((post) => {
      let postObj = post.toJSON();
      postObj.commentCount = commentCount.find((c) => c._id.toString() === post._id.toString())?.count || 0;
      return postObj;
    }),
    );
}