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

  const authToken = await AuthToken.findOne({ token })
    .populate("userId")
    .lean();
  if (!authToken || !authToken.userId || authToken.userId.banned) {
    return null;
  }

  return authToken.userId;
}
