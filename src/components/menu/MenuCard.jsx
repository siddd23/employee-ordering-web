import { MdAccessTime, MdAdd, MdRemove } from "react-icons/md";

import useCart from "../../context/useCart";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const MenuCard = ({ item, categoryName }) => {
  const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    getItemQuantity,
    getEffectivePrice,
  } = useCart();
  const quantity = getItemQuantity(item._id);
  const price = getEffectivePrice(item);
  const nonVegetarian = item.foodType === "Non-Vegetarian";

  return (
    <article className="menu-card">
      <div className="menu-card-image-wrap">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="menu-card-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling?.removeAttribute("hidden");
            }}
          />
        ) : null}
        <div className="menu-image-fallback" hidden={Boolean(item.imageUrl)}>
          <MdRestaurantMenuFallback />
        </div>
        <span className={`food-mark ${nonVegetarian ? "non-veg" : "veg"}`}>
          <i />
          {nonVegetarian ? "Non-Veg" : "Veg"}
        </span>
      </div>

      <div className="menu-card-body">
        <span className="menu-category-label">{categoryName}</span>
        <h3>{item.name}</h3>
        <p>{item.description || "Freshly prepared and served hot."}</p>

        <div className="menu-card-meta">
          <strong>₹{formatMoney(price)}</strong>
          {item.preparationTime > 0 && (
            <span>
              <MdAccessTime />
              {item.preparationTime} min
            </span>
          )}
        </div>

        {quantity === 0 ? (
          <button
            type="button"
            className="add-item-button"
            onClick={() => addToCart(item)}
          >
            <MdAdd /> Add
          </button>
        ) : (
          <div className="quantity-control" aria-label={`${item.name} quantity`}>
            <button
              type="button"
              onClick={() => decreaseQuantity(item._id)}
              aria-label={`Decrease ${item.name}`}
            >
              <MdRemove />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => increaseQuantity(item._id)}
              aria-label={`Increase ${item.name}`}
            >
              <MdAdd />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

const MdRestaurantMenuFallback = () => (
  <span aria-hidden="true">🍽️</span>
);

export default MenuCard;
