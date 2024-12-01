import { verifyRequest } from '$lib/server/verifyRequest.server.js';
import User from '$lib/models/User';

export async function POST({ request, params }) {
    const user = await verifyRequest(request);

    if (!user) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!user.staff) {
        return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const slug = params.slug

    let target = await User.findOne({ username: slug });

    if (!target) {
        return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const { badge } = await request.json();

    if (!badge) {
        return Response.json({ message: 'Badge required' }, { status: 400 });
    }

    if (target.otherBadges && target.otherBadges.includes(badge)) {
        return Response.json({ message: 'Badge already assigned' }, { status: 400 });
    }

    if (!target.otherBadges) {
        target.otherBadges = [];
    }

    target.otherBadges.push(badge);

    await target.save();

    return Response.json({ message: 'Success' });
}