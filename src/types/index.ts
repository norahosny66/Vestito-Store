export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
}

export interface CustomizationRequest {
  id: string;
  productId: string;
  userId: string;
  prompt: string;
  status: 'pending' | 'in-progress' | 'preview-ready' | 'approved' | 'completed';
  previewImage?: string;
  createdAt: Date;
  approvedAt?: Date;
  depositPaid: boolean;
  totalPrice: number;
}

export interface CartItem {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  customization?: CustomizationRequest;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}