import { MdRestaurantMenu, MdSwapHoriz } from "react-icons/md";

const PublicHeader = ({ canChangeCanteen, onChangeCanteen }) => (
  <header className="public-header">
    <div className="public-header-inner">
      <div className="public-brand" aria-label="CanteenFlow">
        <span className="public-brand-mark">
          <MdRestaurantMenu />
        </span>
        <strong>CanteenFlow</strong>
      </div>

      {canChangeCanteen && (
        <button
          type="button"
          className="change-canteen-button"
          onClick={onChangeCanteen}
        >
          <MdSwapHoriz />
          <span>Change canteen</span>
        </button>
      )}
    </div>
  </header>
);

export default PublicHeader;
