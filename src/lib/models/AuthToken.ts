import mongoose from "mongoose";

export interface AuthToken {
  token: string;
  userId: mongoose.Types.ObjectId;
}

const authTokenSchema = new mongoose.Schema<AuthToken>({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

export default mongoose.models.AuthToken ||
  mongoose.model("AuthToken", authTokenSchema);
