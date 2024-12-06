import mongoose from "mongoose";

export interface UserType {
  email: String;
  password: String | null;
  username: String;
  displayName: String;
  bio?: String;
  staff: Boolean;
  verified: Boolean;
  otherBadges: String[];
  banned: Boolean;
  avatarUrl: String;
}

export const userSchema = new mongoose.Schema<UserType>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  displayName: { type: String, required: false },
  bio: { type: String, default: "" },
  staff: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  otherBadges: { type: [String], default: [] },
  banned: { type: Boolean, default: false },
  avatarUrl: {
    type: String,
    default: "https://i.imgur.com/Pu8s9rV.png",
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
