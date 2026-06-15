import { Schema, model, models, Document, Types } from 'mongoose';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkId?: string;
  phone?: string;
  email?: string;
  password?: string;
  role: UserRole;
  name?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  storeName?: string;
  onboardingComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId:   { type: String, unique: true, sparse: true },
    phone:     { type: String, unique: true, sparse: true },
    email:     { type: String, unique: true, sparse: true },
    password:  { type: String },
    role:      { type: String, enum: ['BUYER', 'SELLER', 'ADMIN'], default: 'BUYER' },
    name:      { type: String },
    username:  { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    bio:       { type: String },
    storeName: { type: String },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
