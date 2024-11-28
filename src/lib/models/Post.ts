import mongoose from "mongoose";

export interface PostType {
  content: string;
  authorId: mongoose.Types.ObjectId;
  postedAt: Date;
}

export const postSchema = new mongoose.Schema<PostType>({
  content: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  postedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model("Post", postSchema);
