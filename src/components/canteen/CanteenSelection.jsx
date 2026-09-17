import {
  MdAccessTime,
  MdApartment,
  MdArrowForward,
  MdLocationOn,
  MdStorefront,
} from "react-icons/md";

const officeLocation = (office) =>
  [office?.floor, office?.building, office?.city]
    .filter(Boolean)
    .join(" • ");

const CanteenSelection = ({ office, canteens, onSelect }) => (
  <main className="selection-page page-container">
    <section className="office-hero">
      <span className="office-hero-icon">
        <MdApartment />
      </span>
      <div>
        <span className="eyebrow">Ordering for</span>
        <h1>{office.companyName}</h1>
        <p>
          <MdLocationOn />
          {officeLocation(office) || "Office location"}
        </p>
      </div>
    </section>

    <section className="selection-section">
      <h2>Choose a canteen</h2>
      <div className="canteen-grid">
        {canteens.map((canteen) => (
          <button
            type="button"
            className="canteen-card"
            key={canteen._id}
            onClick={() => onSelect(canteen)}
          >
            <span className="canteen-card-icon">
              <MdStorefront />
            </span>
            <span className="canteen-card-copy">
              <strong>{canteen.name}</strong>
              <small>
                <MdAccessTime />
                {canteen.openingTime}–{canteen.closingTime}
              </small>
            </span>
            <MdArrowForward className="canteen-card-arrow" />
          </button>
        ))}
      </div>
    </section>
  </main>
);

export default CanteenSelection;
