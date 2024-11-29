import { verifyRequest } from "$lib/server/verifyRequest.server";
import AuthToken from "$lib/models/AuthToken";

export async function POST({ request }) {
  let token = request.headers.get("Authorization")?.split(" ")[1];

  await AuthToken.deleteOne({ token });

  return Response.json({ message: "Success" });
}
