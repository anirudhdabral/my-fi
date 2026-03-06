import { model, models, Schema, Document } from "mongoose";

export type UserRole = "admin" | "user";

export interface UserDocument extends Document {
  email: string;
  name?: string;
  role: UserRole;
  approved: boolean;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

const User = models.User || model<UserDocument>("User", userSchema);

export default User;
