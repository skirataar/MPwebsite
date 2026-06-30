import { Schema, model, models, Document, Types } from 'mongoose';

export interface IWishlistItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound unique — one wishlist item per user per product
WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });
WishlistItemSchema.index({ userId: 1 });

export const WishlistItem = models.WishlistItem || model<IWishlistItem>('WishlistItem', WishlistItemSchema);
