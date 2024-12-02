// Silly feature that prob wont be used

import Follow from "$lib/models/Follow";
import User from "$lib/models/User";

export async function GET({ }) {
    const topFollowed = await Follow.aggregate([
        { $group: { _id: "$following", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
    ]);

    return Response.json(
        await Promise.all(
            topFollowed.map(async (f) => {
                let user = await User.findById(f._id);
                return {
                    _id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                    count: f.count,
                };
            }),
        ),
    );
}