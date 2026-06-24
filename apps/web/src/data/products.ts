export interface Product {
  id: number | string;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  seller: string;
  username: string;
  location: string;
  likes: number;
  avatar: string;
  videoBg: string;
  videoUrl?: string;
  productThumb: string;
  dataAlt: string;
  
  // Detail page specifics
  stockLeft?: number;
  rating?: number;
  reviewsCount?: number;
  viewsCount?: string;
  deliveryDate?: string;
  returnPolicy?: string;
  returnPolicyDesc?: string;
  freeDelivery?: boolean;
}


