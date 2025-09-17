'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { ProductWithDetails } from '@/lib/types';

type CartItem = {
  id: number; // variant id
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: ProductWithDetails, variant: ProductWithDetails['product_variants'][0], quantity: number) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: ProductWithDetails, variant: any, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === variant.id);
      if (existingItem) {
        toast.success(`Updated ${product.name} quantity.`);
        return prevCart.map(item =>
          item.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        toast.success(`Added ${product.name} to cart!`);
        const newItem: CartItem = {
          id: variant.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.product_images?.[0]?.image_url || '',
          size: variant.size,
          color: variant.color,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (variantId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== variantId));
    toast.success('Item removed from cart.');
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === variantId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
