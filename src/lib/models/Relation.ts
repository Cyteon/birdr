import mongoose from 'mongoose';

export interface RelationType {
    userId: mongoose.Types.ObjectId;
    targetId: mongoose.Types.ObjectId;
    relation: number; // 1: following, 2: blocked
}

export const RelationSchema = new mongoose.Schema<RelationType>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relation: {
        type: Number,
        required: true,
    },
});

export default mongoose.models.Relation || mongoose.model<RelationType>('Relation', RelationSchema);