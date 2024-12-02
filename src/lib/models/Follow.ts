import mongoose from 'mongoose';

export interface FollowType {
    user: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
}

export const FollowSchema = new mongoose.Schema<FollowType>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export default mongoose.models.Follow || mongoose.model<FollowType>('Follow', FollowSchema);