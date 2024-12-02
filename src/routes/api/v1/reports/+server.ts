import Report from "$lib/models/Report";
import { verifyRequest } from "$lib/server/verifyRequest.server";

export async function GET({ request }) {
  // ⚠️ Restricted Endpoint ⚠️

  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const reports = await Report.find()
    .populate("postAuthorId", "username displayName avatarUrl banned")
    .populate("reporterId", "username displayName avatarUrl")
    .sort({ createdAt: -1 });

  return Response.json(reports);
}

export async function DELETE({ request }) {
  // ⚠️ Restricted Endpoint ⚠️

  const user = await verifyRequest(request);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user.staff) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await request.json();

  await Report.findByIdAndDelete(id);

  return Response.json({ message: "Success" });
}

export async function POST({ request }) {
  const { content, postId, commentId, authorId, type } = await request.json();

  const user = await verifyRequest(request);
  let reporterId = user?._id;

  const existingReport = await Report.findOne({ postId, reporterId, content, type });

  if (existingReport) {
    return Response.json({ message: "Already reported" }, { status: 409 });
  }

  let data = {
    content,
    postAuthorId: authorId,
    reporterId,
    type,
  }

  if (postId) {
    data.postId = postId;
  } else if (commentId) {
    data.commentId = commentId;
  }

  const report = new Report(data);

  await report.save();

  return Response.json({ message: "Success" });
}
