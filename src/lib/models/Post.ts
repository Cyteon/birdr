import mongoose from "mongoose";

export interface ogData {
  opTitle?: string;
  ogType?: string;
  ogUrl?: string;
  ogDescription?: string;
  ogImage?: {
    height: string;
    url: string;
    width: string;
    type: string;
  }[];
}

export interface PostType {
  content: string;
  authorId: mongoose.Types.ObjectId;
  postedAt: Date;
  mentions: Map<string, mongoose.Types.ObjectId>;
  ogData?: Map<string, ogData>;
}

export const postSchema = new mongoose.Schema<PostType>({
  content: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  postedAt: { type: Date, default: Date.now },
  mentions: {
    type: Map,
    of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    default: {},
  },
  ogData: {
    type: Map,
    of: {
      type: Object,
    },
    default: {},
  },
});

export default mongoose.models.Post || mongoose.model("Post", postSchema);
