import User from "$lib/models/User";
import UsernameRedirect from "$lib/models/UsernameRedirect";
import { verifyRequest } from "$lib/server/verifyRequest.server";
import s3 from "$lib/server/s3.server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3_ENDPOINT } from "$env/static/private";

export async function GET({ request }) {
  let user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  user.password = undefined;

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

  if (avatar) {
    if (Buffer.byteLength(avatar, "base64") > 2 * 1024 * 1024) {
      return Response.json({ message: "Avatar should be less than 2MB" }, { status: 400 });
    }

    var buf = Buffer.from(
      avatar.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    let key = `avatars/${user._id}.png`;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: "data",
          Key: key,
        }),
      );
    } catch {}

    await s3.send(
      new PutObjectCommand({
        Bucket: "data",
        Key: key,
        Body: buf,
        ContentType: "image/png",
      }),
    );

    user.avatarUrl = `${S3_ENDPOINT}/object/public/data/${key}`;
  }

  await user.save();

  user.password = undefined;

  return Response.json(user);
}
