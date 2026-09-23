import { MdSwapHoriz } from "react-icons/md";

import bookfoodLogo from "../../assets/bookfood-logo.png";

const PublicHeader = ({ canChangeCanteen, onChangeCanteen }) => (
  <header className="public-header">
    <div className="public-header-inner">
      <div className="public-brand" aria-label="Bookfood">
        <img
          className="public-brand-logo"
          src={bookfoodLogo}
          alt="Bookfood"
        />
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
