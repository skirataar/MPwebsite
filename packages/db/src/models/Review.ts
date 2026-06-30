import { Schema, model, models, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true },
  },
  { timestamps: true }
);

// Compound unique index — one review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review = models.Review || model<IReview>('Review', ReviewSchema);
