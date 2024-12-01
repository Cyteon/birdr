import Comment from "$lib/models/Comment";
import Post from "$lib/models/Post";
import User from "$lib/models/User";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function PUT({ params, request }) {
    let user = await verifyRequest(request);

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { slug } = params;
    const { content } = await request.json();

    const post = await Post.findById(slug);

    if (!post) {
        return Response.json(
            { error: "Post not found" },
            { status: 404 }
        )
    };

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

    const comment = new Comment({
        authorId: user._id,
        postId: post._id,
        content,
        mentions,
    });

    await comment.save();

    return Response.json(comment);
}