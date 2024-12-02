import User from "$lib/models/User";
import Post from "$lib/models/Post";
import Comment from "$lib/models/Comment";
import UsernameRedirect from "$lib/models/UsernameRedirect";

export async function GET({ params }) {
  let username = params.slug;

  let user = await User.findOne({ username });

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

  return Response.json({
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    banned: user.banned,
    otherBadges: user.otherBadges,
    staff: user.staff,
    verified: user.verified,
    posts: posts.map((post) => {
      let postObj = post.toJSON();
      postObj.commentCount =
        commentCount.find((c) => c._id.toString() === post._id.toString())
          ?.count || 0;
      return postObj;
    }),
  });
}
