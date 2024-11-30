import mongoose from "mongoose";

// if u change username, it will redir to new, unless someone change to your old username

export interface UsernameRedirectType {
  from: string;
  to: string;
  validUntil?: Date;
}

export const usernameRedirectSchema = new mongoose.Schema<UsernameRedirectType>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }, // for 2 weeks username cant be changed
    validUntil: { type: Date, default: Date.now() + 1000 * 60 * 60 * 24 * 7 },
  },
);

export default mongoose.models.UsernameRedirect ||
  mongoose.model("UsernameRedirect", usernameRedirectSchema);
