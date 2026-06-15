import { Schema, model, models, Document, Types } from 'mongoose';

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'ESCROW_RELEASED' | 'REFUNDED';

export interface IOrder extends Document {
  _id: Types.ObjectId;
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  amount: number;
  quantity: number;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId:            { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
    productId:          { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId:           { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
    amount:             { type: Number, required: true },
    quantity:           { type: Number, default: 1, min: 1 },
    status:             { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'ESCROW_RELEASED', 'REFUNDED'], default: 'PENDING', index: true },
    razorpayOrderId:    { type: String, unique: true, sparse: true },
    razorpayPaymentId:  { type: String },
    razorpaySignature:  { type: String },
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>('Order', OrderSchema);
