import User from "$lib/models/User";
import Post from "$lib/models/Post";

export async function GET({ params }) {
  let username = params.slug;

  let user = await User.findOne({ username });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  let posts = await Post.find({ authorId: user._id })
    .limit(50)
    .sort({ postedAt: -1 });

  return Response.json({
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    posts,
  });
}
