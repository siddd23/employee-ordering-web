import { useEffect, useState } from "react";
import { MdClose, MdLockOutline, MdPersonOutline, MdPhone } from "react-icons/md";

import useCart from "../../context/useCart";
import { getApiError } from "../../services/api";
import { placePublicOrder } from "../../services/publicOrderingService";

const CUSTOMER_KEY = "bookfood_employee_details_v1";
const LEGACY_CUSTOMER_KEY = "canteenflow_employee_details_v1";

const readCustomer = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CUSTOMER_KEY) ||
        localStorage.getItem(LEGACY_CUSTOMER_KEY) ||
        "{}",
    );
    return {
      customerName: String(saved.customerName || ""),
      mobile: String(saved.mobile || ""),
      customerNote: "",
    };
  } catch {
    return { customerName: "", mobile: "", customerNote: "" };
  }
};

const CheckoutHandoff = ({ open, officeCode, canteen, onClose, onSuccess }) => {
  const { cartItems, itemCount, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(readCustomer);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [loading, onClose, open]);

  if (!open) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (loading) return;

    const customerName = form.customerName.trim();
    const mobile = form.mobile.trim();
    const customerNote = form.customerNote.trim();

    if (customerName.length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const order = await placePublicOrder({
        officeCode,
        canteenId: canteen._id,
        customerName,
        mobile,
        customerNote,
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      });
      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify({ customerName, mobile }),
      );
      clearCart();
      setForm((current) => ({ ...current, customerNote: "" }));
      onSuccess(order);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to place your order."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={loading ? undefined : onClose}
    >
      <section
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <MdClose />
        </button>
        <header className="checkout-heading">
          <span className="eyebrow">Complete your order</span>
          <h2 id="checkout-title">Delivery details</h2>
          <p>{canteen?.name} · {itemCount} {itemCount === 1 ? "item" : "items"}</p>
        </header>

        <form onSubmit={submitOrder} className="checkout-form">
          <label>
            <span>Your name</span>
            <div className="checkout-input">
              <MdPersonOutline />
              <input
                autoFocus
                name="customerName"
                value={form.customerName}
                onChange={updateField}
                maxLength={80}
                autoComplete="name"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </label>
          <label>
            <span>Mobile number</span>
            <div className="checkout-input">
              <MdPhone />
              <input
                name="mobile"
                value={form.mobile}
                onChange={updateField}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                autoComplete="tel"
                placeholder="10-digit mobile number"
                disabled={loading}
              />
            </div>
          </label>
          <label>
            <span>Special instructions <em>Optional</em></span>
            <textarea
              name="customerNote"
              value={form.customerNote}
              onChange={updateField}
              maxLength={300}
              rows={3}
              placeholder="Less spicy, no onion, delivery note..."
              disabled={loading}
            />
            <small>{form.customerNote.length}/300</small>
          </label>

          <div className="checkout-total">
            <div><span>Items</span><strong>{itemCount}</strong></div>
            <div className="checkout-grand-total">
              <span>Amount payable</span><strong>₹{subtotal}</strong>
            </div>
          </div>

          {error && <p className="checkout-error" role="alert">{error}</p>}

          <button className="place-order-button" type="submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Placing order...</> : `Place order · ₹${subtotal}`}
          </button>
          <p className="secure-order-note">
            <MdLockOutline /> Pay directly to the canteen after delivery.
          </p>
        </form>
      </section>
    </div>
  );
};

export default CheckoutHandoff;
