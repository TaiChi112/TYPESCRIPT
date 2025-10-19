export interface User {
  id: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  paymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
