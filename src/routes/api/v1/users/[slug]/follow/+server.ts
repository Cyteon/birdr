import Relation from "$lib/models/Relation";
import User from "$lib/models/User";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function PUT({ request, params }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const slug = params.slug;

  const target = await User.findOne({ username: slug });

  if (!target) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  if (target._id.equals(user._id)) {
    return Response.json({ message: "Can't follow yourself" }, { status: 400 });
  }

  const relation = await Relation.findOne({
    userId: user._id,
    targetId: target._id,
  });

  if (relation) {
    if (relation.relation === 1) {
      return Response.json({ message: "Already following" }, { status: 409 });
    } else if (relation.relation === 2) {
      return Response.json(
        { message: "Can't follow a blocked user" },
        { status: 409 },
      );
    }
  }

  await new Relation({
    userId: user._id,
    targetId: target._id,
    relation: 1,
  }).save();

  return Response.json({ message: "Followed" });
}

export async function DELETE({ request, params }) {
  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const slug = params.slug;

  const target = await User.findOne({ username: slug });

  if (!target) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  if (target._id.equals(user._id)) {
    return Response.json(
      { message: "Can't unfollow yourself" },
      { status: 400 },
    );
  }

  const following = await Relation.findOne({
    userId: user._id,
    targetId: target._id,
    relation: 1,
  });

  if (!following) {
    return Response.json({ message: "Not following" }, { status: 409 });
  }

  await Relation.findByIdAndDelete(following._id);

  return Response.json({ message: "Unfollowed" });
}
