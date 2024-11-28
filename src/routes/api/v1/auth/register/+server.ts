import User from "$lib/models/User";
import AuthToken from "$lib/models/AuthToken";
import bcrypt from "bcrypt";
import { typeid } from "typeid-ts";

export async function POST({ request }) {
  const { email, password, username, displayName } = await request.json();

  const existing = await User.find({
    $or: [{ email }, { username }],
  });

  if (existing.length > 0) {
    return Response.json(
      { message: "Email or username already in use" },
      { status: 400 },
    );
  }

  const id = typeid("user");

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    id,
    email,
    password: hashedPassword,
    username,
    displayName,
  });

  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes));

  await AuthToken.create({ token, userId: id });

  return Response.json({ message: "Success", token });
}
