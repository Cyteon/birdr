import User from "$lib/models/User";
import AuthToken from "$lib/models/AuthToken";
import bcrypt from "bcrypt";
import { typeid } from "typeid-ts";

export async function POST({ request }) {
  const { email, password, username, displayName } = await request.json();

  if (email.endsWith("@ambrosia.gg")) {
    return Response.json({ message: "Invalid email" }, { status: 400 });
  }

  if (/[^a-zA-Z0-9_]/.test(username)) {
    return Response.json(
      { message: "Username can only contain letters, numbers and underscores" },
      { status: 400 },
    );
  }

  if (username.length > 20) {
    return Response.json({ message: "Username too long" }, { status: 400 });
  }

  if (displayName.length > 30) {
    return Response.json({ message: "Display name too long" }, { status: 400 });
  }

  const existing = await User.find({
    $or: [{ email }, { username }],
  });

  if (existing.length > 0) {
    return Response.json(
      { message: "Email or username already in use" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user = await User.create({
    email,
    password: hashedPassword,
    username,
    displayName,
  });

  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes));

  await AuthToken.create({ token, userId: user._id });

  return Response.json({ message: "Success", token });
}
