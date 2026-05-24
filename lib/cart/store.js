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

      /** @param {Omit<CartItem, 'id'> & { id?: string }} payload */
      addItem: (payload) => {
        const id = payload.id ?? buildCartItemId(payload);
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: item.quantity + payload.quantity }
                  : item,
              ),
            };
          }
          return {
            items: [...state.items, { ...payload, id, quantity: payload.quantity }],
          };
        });
      },

      /** @param {string} id */
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
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
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'kyara-cart' },
  ),
);
