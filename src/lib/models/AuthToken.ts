import mongoose from "mongoose";

export interface AuthToken {
  token: string;
  userId: string;
}

const authTokenSchema = new mongoose.Schema<AuthToken>({
  token: { type: String, required: true },
  userId: { type: String, required: true },
});

export default mongoose.model("AuthToken", authTokenSchema);
