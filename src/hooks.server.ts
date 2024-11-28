import mongoose from "mongoose";
import { MONGODB_URI } from "$env/static/private";

await mongoose.connect(MONGODB_URI);
