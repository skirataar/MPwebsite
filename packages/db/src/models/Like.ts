import { Schema, model, models, Document, Types } from 'mongoose';

export interface ILike extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound unique — one like per user per product
LikeSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Like = models.Like || model<ILike>('Like', LikeSchema);
