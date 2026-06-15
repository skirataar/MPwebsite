export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  muxAssetId: string;
  muxPlaybackId: string;
  url: string;
  thumbnailUrl: string | null;
  sellerId: string;
  productId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  sellerId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'ESCROW_RELEASED' | 'REFUNDED';
  razorpayOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
