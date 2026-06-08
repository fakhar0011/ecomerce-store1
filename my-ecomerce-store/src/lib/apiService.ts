// API Service for connecting to Express backend

import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

class APIService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds timeout
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          throw new Error(error.response.data.message || 'API request failed');
        } else if (error.request) {
          // Request made but no response
          throw new Error('Network error - please check your connection');
        } else {
          // Something else happened
          throw new Error(error.message || 'API request failed');
        }
      }
    );
  }

  private async request(endpoint: string, options: RequestOptions = {}) {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.body,
    };

    const response = await this.axiosInstance.request(config);
    return response.data;
  }

  // Auth endpoints
  async signup(name: string, email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  // Product endpoints
  async getProducts(category?: string, page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: { productId, quantity },
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: { productId, quantity },
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(items: any[], shippingAddress: any) {
    return this.request('/orders', {
      method: 'POST',
      body: { items, shippingAddress },
    });
  }

  async getUserOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }
}

export const apiService = new APIService(API_BASE_URL);
