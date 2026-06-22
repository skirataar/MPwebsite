import { Schema, model, models, Document } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  description: string;
  value: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key:         { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    value:       { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const FeatureFlag = models.FeatureFlag || model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
