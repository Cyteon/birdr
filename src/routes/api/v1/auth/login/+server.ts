import User from "$lib/models/User";
import AuthToken from "$lib/models/AuthToken";
import bcrypt from "bcrypt";

export async function POST({ request }) {
  const { identifier, password } = await request.json();

  const isEmail = identifier.includes("@");

  const user = await User.findOne({
    [isEmail ? "email" : "username"]: identifier,
  });

  if (!user) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }

  if (user.banned) {
    return Response.json({ message: "You have been banned" }, { status: 403 });
  }

  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes));

  await AuthToken.create({ token, userId: user._id });

  return Response.json({ message: "Success", token });
}
