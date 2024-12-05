import AuthToken from "$lib/models/AuthToken";
import User from "$lib/models/User";

export async function verifyRequest(request, hydrate = false) {
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

  if (hydrate) {
    return await User.findById(authToken.userId._id);
  } else {
    return authToken.userId;
  }
}
