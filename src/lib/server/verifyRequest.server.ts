import AuthToken from "$lib/models/AuthToken";
import User from "$lib/models/User";

export async function verifyRequest(request) {
  let token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    token = request.headers.get("cookie")?.split("token=")[1];
  }

  if (!token) {
    return null;
  }

  const authToken = await AuthToken.findOne({ token });

  if (!authToken) {
    return null;
  }

  const user = await User.findOne({ _id: authToken.userId });

  if (!user) {
    return null;
  }

  return user;
}
