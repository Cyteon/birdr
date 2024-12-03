import Post from "$lib/models/Post";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function PUT({ params, request }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;

    const post = await Post.findById(slug);

    if (!post) {
        return Response.json({ error: "Post not found" }, { status: 404 });
    }

    post.likeUserIds = post.likeUserIds || [];

    if (post.likeUserIds.includes(user._id)) {
        return Response.json({ error: "Already liked" }, { status: 400 });
    } else {
        post.likeUserIds.push(user._id);
    }

    if (post.dislikeUserIds?.includes(user._id)) {
        post.dislikeUserIds = post.dislikeUserIds.filter((id) => id.toString() != user._id);
    }

    await post.save();
    return Response.json({ message: "Success" });
}

export async function DELETE({ params, request }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;

    const post = await Post.findById(slug);

    if (!post) {
        return Response.json({ error: "Post not found" }, { status: 404 });
    }

    post.likeUserIds = post.likeUserIds || [];

    if (!post.likeUserIds.includes(user._id)) {
        return Response.json({ error: "Not liked" }, { status: 400 });
    } else {
        post.likeUserIds = post.likeUserIds.filter((id) => id.toString() != user._id);
    }

    await post.save();
    return Response.json({ message: "Success" });
}