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

    let users = await User.find().lean();

    users = await Promise.all(
        users.map(async (user) => {
            const [postCount, commentCount, followingCount, followerCount] = await Promise.all([
                Post.countDocuments({ authorId: user._id }),
                Comment.countDocuments({ authorId: user._id }),
                Relation.countDocuments({ userId: user._id }),
                Relation.countDocuments({ targetId: user._id, relation: 1 })
            ]);

            user.postCount = postCount;
            user.commentCount = commentCount;
            user.followingCount = followingCount;
            user.followerCount = followerCount;
            user.password = undefined;

            return user;
        })
    );

    return Response.json(
       users
    );
}