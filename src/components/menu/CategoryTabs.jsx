const CategoryTabs = ({ categories, selected, onSelect }) => (
  <div className="category-tabs" aria-label="Menu categories">
    <button
      type="button"
      className={selected === "all" ? "active" : ""}
      onClick={() => onSelect("all")}
    >
      All
    </button>
    {categories.map((category) => (
      <button
        type="button"
        key={category._id}
        className={selected === category._id ? "active" : ""}
        onClick={() => onSelect(category._id)}
      >
        {category.name}
      </button>
    ))}
  </div>
);

export default CategoryTabs;
