import { AuthResponse, Product, Order } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Health check
  async health(): Promise<{ ok: boolean; service: string; timestamp: string }> {
    return this.request<{ ok: boolean; service: string; timestamp: string }>('/health');
  }

  // Auth endpoints
  async signup(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signout(): Promise<{ ok: boolean; message: string }> {
    return this.request<{ ok: boolean; message: string }>('/auth/sign-out', {
      method: 'POST',
    });
  }

  async getMe(): Promise<{ user: any }> {
    return this.request<{ user: any }>('/auth/me');
  }

  // Product endpoints
  async getProducts(): Promise<{ ok: boolean; data: Product[] }> {
    return this.request<{ ok: boolean; data: Product[] }>('/products');
  }

  async getProduct(id: string): Promise<{ ok: boolean; data: Product }> {
    return this.request<{ ok: boolean; data: Product }>(`/products/${id}`);
  }

  // Cart/Checkout endpoints
  async checkout(items: any[]): Promise<{ ok: boolean; orderId: string; message: string }> {
    return this.request<{ ok: boolean; orderId: string; message: string }>('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Order endpoints
  async createPaymentIntent(items: any[]): Promise<{ clientSecret: string }> {
    return this.request<{ clientSecret: string }>('/orders/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async confirmOrder(paymentIntentId: string): Promise<Order> {
    return this.request<Order>('/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  // Admin endpoints
  async getAdminOrders(): Promise<Order[]> {
    return this.request<Order[]>('/admin/orders');
  }

  async updateProductStock(productId: string, stock: number): Promise<Product> {
    return this.request<Product>(`/admin/products/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    });
  }
}

export const api = new ApiClient();
