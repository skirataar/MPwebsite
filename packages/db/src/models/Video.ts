import { Schema, model, models, Document, Types } from 'mongoose';

export interface IVideo extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  muxAssetId?: string;
  muxPlaybackId?: string;
  url: string;
  thumbnailUrl?: string;
  views: number;
  sellerId: Types.ObjectId;
  productId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title:         { type: String, required: true },
    description:   { type: String },
    muxAssetId:    { type: String },
    muxPlaybackId: { type: String },
    url:           { type: String, required: true },
    thumbnailUrl:  { type: String },
    views:         { type: Number, default: 0 },
    sellerId:      { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
    productId:     { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  },
  { timestamps: true }
);

export const Video = models.Video || model<IVideo>('Video', VideoSchema);
