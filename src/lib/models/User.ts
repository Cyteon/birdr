import mongoose from "mongoose";

export interface UserType {
  id: String;
  email: String;
  password: String;
  username: String;
  displayName: String;
}

export const userSchema = new mongoose.Schema<UserType>({
  id: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  displayName: { type: String, required: false },
});

export default mongoose.model("User", userSchema);
