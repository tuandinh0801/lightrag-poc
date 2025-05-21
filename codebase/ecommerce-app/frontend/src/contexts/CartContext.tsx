import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cartApi, CartItem } from '../services/api';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [localCart, setLocalCart] = useState<Record<string, number>>({});

  // Fetch cart from server if authenticated
  const { data: serverCart = [], isLoading } = useQuery<CartItem[]>(
    'cart',
    cartApi.getCart,
    {
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch cart', error);
      },
    }
  );

  // Sync local cart with server on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      // If we have items in local cart and user logs in, sync with server
      if (Object.keys(localCart).length > 0) {
        const syncCart = async () => {
          try {
            await Promise.all(
              Object.entries(localCart).map(([productId, quantity]) =>
                cartApi.addToCart(productId, quantity)
              )
            );
            setLocalCart({});
            queryClient.invalidateQueries('cart');
          } catch (error) {
            console.error('Failed to sync cart', error);
          }
        };
        syncCart();
      } else {
        // Otherwise just refresh the cart
        queryClient.invalidateQueries('cart');
      }
    }
  }, [isAuthenticated]);

  // Add to cart mutation
  const addToCartMutation = useMutation(
    ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      isAuthenticated
        ? cartApi.addToCart(productId, quantity)
        : Promise.resolve(),
    {
      onMutate: async ({ productId, quantity = 1 }) => {
        if (!isAuthenticated) {
          // Update local cart for unauthenticated users
          setLocalCart((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 0) + quantity,
          }));
          return;
        }
        
        // Optimistic update for authenticated users
        await queryClient.cancelQueries('cart');
        const previousCart = queryClient.getQueryData<CartItem[]>('cart') || [];
        
        const existingItem = previousCart.find((item) => item.id === productId);
        
        if (existingItem) {
          const updatedCart = previousCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          queryClient.setQueryData('cart', updatedCart);
        } else {
          // In a real app, we would fetch the product details here
          const newItem: CartItem = {
            id: productId,
            name: `Product ${productId}`,
            price: 0,
            quantity,
            description: '',
            imageUrl: '',
            category: '',
            stock: 0,
            rating: 0,
            reviews: [],
          };
          queryClient.setQueryData('cart', [...previousCart, newItem]);
        }
        
        return { previousCart };
      },
      onError: (error, variables, context) => {
        console.error('Failed to add to cart', error);
        if (context?.previousCart) {
          queryClient.setQueryData('cart', context.previousCart);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  // Update quantity mutation
  const updateQuantityMutation = useMutation(
    ({ productId, quantity }: { productId: string; quantity: number }) =>
      isAuthenticated
        ? cartApi.updateCartItem(productId, quantity)
        : Promise.resolve(),
    {
      onMutate: async ({ productId, quantity }) => {
        if (!isAuthenticated) {
          setLocalCart((prev) => ({
            ...prev,
            [productId]: quantity,
          }));
          return;
        }

        await queryClient.cancelQueries('cart');
        const previousCart = queryClient.getQueryData<CartItem[]>('cart') || [];
        
        const updatedCart = previousCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        
        queryClient.setQueryData('cart', updatedCart);
        return { previousCart };
      },
      onError: (error, variables, context) => {
        console.error('Failed to update quantity', error);
        if (context?.previousCart) {
          queryClient.setQueryData('cart', context.previousCart);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  // Remove from cart mutation
  const removeFromCartMutation = useMutation(
    (productId: string) =>
      isAuthenticated
        ? cartApi.removeFromCart(productId)
        : Promise.resolve(),
    {
      onMutate: async (productId) => {
        if (!isAuthenticated) {
          setLocalCart((prev) => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
          });
          return;
        }

        await queryClient.cancelQueries('cart');
        const previousCart = queryClient.getQueryData<CartItem[]>('cart') || [];
        
        const updatedCart = previousCart.filter((item) => item.id !== productId);
        queryClient.setQueryData('cart', updatedCart);
        
        return { previousCart };
      },
      onError: (error, variables, context) => {
        console.error('Failed to remove from cart', error);
        if (context?.previousCart) {
          queryClient.setQueryData('cart', context.previousCart);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  // Clear cart mutation
  const clearCartMutation = useMutation(
    () => (isAuthenticated ? cartApi.clearCart() : Promise.resolve()),
    {
      onMutate: async () => {
        if (!isAuthenticated) {
          setLocalCart({});
          return;
        }

        await queryClient.cancelQueries('cart');
        const previousCart = queryClient.getQueryData<CartItem[]>('cart') || [];
        
        queryClient.setQueryData('cart', []);
        return { previousCart };
      },
      onError: (error, variables, context) => {
        console.error('Failed to clear cart', error);
        if (context?.previousCart) {
          queryClient.setQueryData('cart', context.previousCart);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  // Combine server cart with local cart for unauthenticated users
  const items = isAuthenticated
    ? serverCart
    : Object.entries(localCart).map(([id, quantity]) => ({
        id,
        name: `Product ${id}`,
        price: 0,
        quantity,
        description: '',
        imageUrl: '',
        category: '',
        stock: 0,
        rating: 0,
        reviews: [],
      }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    items,
    itemCount,
    total,
    isLoading,
    addToCart: (productId: string, quantity = 1) =>
      addToCartMutation.mutateAsync({ productId, quantity }),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantityMutation.mutateAsync({ productId, quantity }),
    removeFromCart: (productId: string) =>
      removeFromCartMutation.mutateAsync(productId),
    clearCart: () => clearCartMutation.mutateAsync(),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
