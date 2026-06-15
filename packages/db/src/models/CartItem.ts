import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICartItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:  { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

// One cart entry per user per product
CartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });
CartItemSchema.index({ userId: 1 });

export const CartItem = models.CartItem || model<ICartItem>('CartItem', CartItemSchema);
