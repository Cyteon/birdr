import User from "$lib/models/User";
import UsernameRedirect from "$lib/models/UsernameRedirect";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function GET({ request }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  delete user.password;

  return Response.json(user);
}

export async function PATCH({ request }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let { displayName, username, avatar } = await request.json();

  if (displayName) {
    user.displayName = displayName;
  }

  console.log(avatar);

  if (username) {
    let existingUser = await User.findOne({ username });

    if (existingUser) {
      return Response.json(
        { message: "Username already taken" },
        { status: 409 },
      );
    }

    let existingRedirect = await UsernameRedirect.findOne({ to: username });

    if (existingRedirect) {
      if (
        existingRedirect.validUntil > Date.now() &&
        existingRedirect.to !== user.username // so u can change back
      ) {
        return Response.json(
          { message: "Username is reserved until a later date" },
          { status: 409 },
        );
      } else {
        await UsernameRedirect.findByIdAndDelete(existingRedirect._id);
      }
    }

    let redirect = new UsernameRedirect({
      from: user.username,
      to: username,
    });

    await UsernameRedirect.deleteMany({ to: user.username });
    await redirect.save();

    user.username = username;
  }

  await user.save();

  user.password = undefined;

  return Response.json(user);
}
