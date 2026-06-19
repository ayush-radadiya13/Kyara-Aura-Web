'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} image
 * @property {string} size
 * @property {string} sizeLabel
 * @property {number} quantity
 * @property {number} price
 * @property {number} originalPrice
 * @property {number} [subtotal]
 * @property {number|string} [cartItemId]
 * @property {number|string} [productSizeId]
 */

/**
 * @param {Omit<CartItem, 'id'> & { id?: string }} item
 * @returns {string}
 */
export function buildCartItemId({ slug, size }) {
  return `${slug}::${size}`;
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: /** @type {CartItem[]} */ ([]),
      total: 0,
      itemCount: 0,
      buyTwoGetOneDiscountAmount: 0,

      /**
       * @param {{ items?: CartItem[], total?: number, itemCount?: number, buyTwoGetOneDiscountAmount?: number }} cart
       */
      setCart: (cart) => {
        const items = cart.items ?? [];
        set({
          items,
          total: cart.total ?? items.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0),
          itemCount: cart.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0),
          buyTwoGetOneDiscountAmount: cart.buyTwoGetOneDiscountAmount ?? 0,
        });
      },

      /** @param {Omit<CartItem, 'id'> & { id?: string }} payload */
      addItem: (payload) => {
        const id = payload.id ?? buildCartItemId(payload);
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            const items = state.items.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity + payload.quantity }
                : item,
            );
            return {
              items,
              itemCount: items.reduce((total, item) => total + item.quantity, 0),
            };
          }
          const items = [...state.items, { ...payload, id, quantity: payload.quantity }];
          return {
            items,
            itemCount: items.reduce((total, item) => total + item.quantity, 0),
          };
        });
      },

      /** @param {string} id */
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          itemCount: state.items
            .filter((item) => item.id !== id)
            .reduce((total, item) => total + item.quantity, 0),
        }));
      },

      /** @param {string} id @param {number} quantity */
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
          itemCount: state.items.reduce((total, item) => total + (item.id === id ? quantity : item.quantity), 0),
        }));
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0, buyTwoGetOneDiscountAmount: 0 }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'kyara-cart' },
  ),
);
