import { Schema, model, models, Document, Types } from 'mongoose';

export type ProductStatus = 'DRAFT' | 'REVIEW' | 'LIVE' | 'REJECTED';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: ProductStatus;
  sellerId: Types.ObjectId;
  likesCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title:        { type: String, required: true },
    description:  { type: String, required: true },
    price:        { type: Number, required: true },
    mrp:          { type: Number },
    stock:        { type: Number, default: 1 },
    category:     { type: String, default: 'handmade', index: true },
    imageUrl:     { type: String, required: true },
    videoUrl:     { type: String },
    thumbnailUrl: { type: String },
    status:       { type: String, enum: ['DRAFT', 'REVIEW', 'LIVE', 'REJECTED'], default: 'REVIEW', index: true },
    sellerId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    likesCount:   { type: Number, default: 0 },
    viewsCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ title: 'text', description: 'text' });

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
