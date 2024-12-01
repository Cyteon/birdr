import mongoose from "mongoose";

export interface CommentType {
    authorId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    content: string;
    mentions: Map<string, mongoose.Types.ObjectId>;
    postedAt: Date;
}

export const commentSchema = new mongoose.Schema<CommentType>({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post",
    },
    content: { type: String, required: true },
    mentions: {
        type: Map,
        of: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        default: {},
    },
    postedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);