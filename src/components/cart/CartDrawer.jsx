import { useEffect } from "react";
import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdRemove,
} from "react-icons/md";

import useCart from "../../context/useCart";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getEffectivePrice,
    itemCount,
    subtotal,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onMouseDown={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="cart-header">
          <div>
            <span className="eyebrow">Your order</span>
            <h2>Cart</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart">
            <MdClose />
          </button>
        </header>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span>🛒</span>
              <h3>Your cart is empty</h3>
              <p>Add something delicious from the menu.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const price = getEffectivePrice(item);
              return (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>
                  <div className="cart-item-copy">
                    <div className="cart-item-heading">
                      <h3>{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                    <p>₹{formatMoney(price)} each</p>
                    <div className="cart-item-bottom">
                      <div className="quantity-control small">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item._id)}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <MdRemove />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item._id)}
                          aria-label={`Increase ${item.name}`}
                        >
                          <MdAdd />
                        </button>
                      </div>
                      <strong>₹{formatMoney(price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="cart-footer">
            <div className="cart-summary-row">
              <span>{itemCount} items</span>
              <strong>₹{formatMoney(subtotal)}</strong>
            </div>
            <button
              type="button"
              className="checkout-button"
              onClick={onCheckout}
            >
              Continue to checkout
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
