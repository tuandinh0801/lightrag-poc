import axios from 'axios';
import { Product, Review, Order, User, CartItem } from '../types/product';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productApi = {
  getProducts: async (params?: { category?: string; search?: string; sort?: string }) => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (product: Omit<Product, 'id' | 'reviews' | 'rating'>) => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },
  
  updateProduct: async (id: string, updates: Partial<Product>) => {
    const response = await api.put<Product>(`/products/${id}`, updates);
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
  
  addReview: async (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const response = await api.post<Review>(`/products/${productId}/reviews`, review);
    return response.data;
  },
};

export const cartApi = {
  getCart: async () => {
    const response = await api.get<CartItem[]>('/cart');
    return response.data;
  },
  
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post<CartItem>('/cart/items', { productId, quantity });
    return response.data;
  },
  
  updateCartItem: async (productId: string, quantity: number) => {
    const response = await api.put<CartItem>(`/cart/items/${productId}`, { quantity });
    return response.data;
  },
  
  removeFromCart: async (productId: string) => {
    await api.delete(`/cart/items/${productId}`);
  },
  
  clearCart: async () => {
    await api.delete('/cart');
  },
};

export const orderApi = {
  getOrders: async () => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  
  getOrderById: async (id: string) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }) => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  
  updateProfile: async (updates: Partial<User>) => {
    const response = await api.put<User>('/auth/profile', updates);
    return response.data;
  },
};
