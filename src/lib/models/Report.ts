import mongoose from "mongoose";

export interface ReportType {
  content: string; // post content
  postAuthorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reportedAt: Date;
}

export const reportSchema = new mongoose.Schema<ReportType>({
  content: { type: String, required: true },
  postAuthorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reportedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
