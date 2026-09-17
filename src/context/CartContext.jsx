import { useCallback, useEffect, useMemo, useState } from "react";

import CartContext from "./cart-context";

const STORAGE_KEY = "canteenflow_employee_carts_v1";
const readStoredCarts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const effectivePrice = (item) => {
  const normalPrice = Number(item?.price || 0);
  const discountedPrice = Number(item?.discountedPrice);
  return Number.isFinite(discountedPrice) && discountedPrice < normalPrice
    ? discountedPrice
    : normalPrice;
};

export function CartProvider({ children }) {
  const [scopeKey, setScopeKey] = useState("");
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!scopeKey) return;
    const carts = readStoredCarts();
    carts[scopeKey] = cartItems;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  }, [cartItems, scopeKey]);

  const setCartScope = useCallback((officeCode, canteenId) => {
    const nextScope = `${String(officeCode).toUpperCase()}::${canteenId}`;
    const carts = readStoredCarts();
    setScopeKey(nextScope);
    setCartItems(Array.isArray(carts[nextScope]) ? carts[nextScope] : []);
  }, []);

  const addToCart = useCallback((item) => {
    setCartItems((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      if (existing) {
        return current.map((entry) =>
          entry._id === item._id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }, []);

  const increaseQuantity = useCallback((itemId) => {
    setCartItems((current) =>
      current.map((item) =>
        item._id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((itemId) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item._id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((current) =>
      current.filter((item) => item._id !== itemId),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const value = useMemo(() => {
    const itemCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const subtotal = cartItems.reduce(
      (total, item) => total + effectivePrice(item) * item.quantity,
      0,
    );
    return {
      cartItems,
      itemCount,
      subtotal,
      setCartScope,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getEffectivePrice: effectivePrice,
      getItemQuantity: (itemId) =>
        cartItems.find((item) => item._id === itemId)?.quantity || 0,
    };
  }, [
    addToCart,
    cartItems,
    clearCart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
    setCartScope,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
