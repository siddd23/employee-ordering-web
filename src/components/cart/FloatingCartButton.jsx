import { MdShoppingCart } from "react-icons/md";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const FloatingCartButton = ({ itemCount, subtotal, onClick }) => {
  if (itemCount === 0) return null;

  return (
    <button type="button" className="floating-cart" onClick={onClick}>
      <span>
        <MdShoppingCart />
        View cart · {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      <strong>₹{formatMoney(subtotal)}</strong>
    </button>
  );
};

export default FloatingCartButton;
