import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MdLocationOn, MdSearch, MdStorefront } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import CanteenSelection from "../components/canteen/CanteenSelection";
import CartDrawer from "../components/cart/CartDrawer";
import FloatingCartButton from "../components/cart/FloatingCartButton";
import PageState from "../components/common/PageState";
import CheckoutHandoff from "../components/checkout/CheckoutHandoff";
import PublicHeader from "../components/layout/PublicHeader";
import CategoryTabs from "../components/menu/CategoryTabs";
import MenuCard from "../components/menu/MenuCard";
import useCart from "../context/useCart";
import { getApiError } from "../services/api";
import {
  getPublicMenu,
  getMasterCanteenMenu,
  resolveMasterCanteen,
  resolveOffice,
} from "../services/publicOrderingService";

const OrderPage = () => {
  const { officeCode = "", publicCode = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const normalizedOfficeCode = officeCode.trim().toUpperCase();
  const normalizedPublicCode = publicCode.trim().toUpperCase();
  const isMasterQr = Boolean(normalizedPublicCode);
  const preferredCanteenId = searchParams.get("canteenId") || "";
  const { itemCount, subtotal, setCartScope } = useCart();

  const [resolution, setResolution] = useState(null);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [menu, setMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const openCanteen = useCallback(
    async (canteen, signal) => {
      setLoading(true);
      setError("");
      setSelectedCanteen(canteen);
      setSelectedCategory("all");
      setSearch("");

      try {
        const menuData = isMasterQr
          ? await getMasterCanteenMenu(normalizedPublicCode, signal)
          : await getPublicMenu({
              officeCode: normalizedOfficeCode,
              canteenId: canteen._id,
              signal,
            });
        setMenu(menuData);
        setCartScope(
          isMasterQr ? normalizedPublicCode : normalizedOfficeCode,
          canteen._id,
        );
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED") return;
        setError(getApiError(requestError, "Unable to load this canteen menu."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [isMasterQr, normalizedOfficeCode, normalizedPublicCode, setCartScope],
  );

  const loadOffice = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      setResolution(null);
      setSelectedCanteen(null);
      setMenu(null);

      try {
        if (isMasterQr) {
          const data = await resolveMasterCanteen(normalizedPublicCode, signal);
          const canteen = data?.canteen;
          if (!canteen) throw new Error("Canteen not found");
          setResolution({ office: null, canteens: [canteen] });
          await openCanteen(canteen, signal);
          return;
        }

        const data = await resolveOffice(normalizedOfficeCode, signal);
        setResolution(data);
        const preferredCanteen = data?.canteens?.find(
          (canteen) => canteen._id === preferredCanteenId,
        );
        if (preferredCanteen) {
          await openCanteen(preferredCanteen, signal);
        } else if (data?.canteens?.length === 1) {
          await openCanteen(data.canteens[0], signal);
        }
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED") return;
        setError(
          getApiError(
            requestError,
            isMasterQr
              ? "Unable to open this canteen master QR."
              : "Unable to open this office QR.",
          ),
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [
      isMasterQr,
      normalizedOfficeCode,
      normalizedPublicCode,
      openCanteen,
      preferredCanteenId,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadOffice(controller.signal);
    return () => controller.abort();
  }, [loadOffice]);

  const categoryNames = useMemo(
    () =>
      Object.fromEntries(
        (menu?.categories || []).map((category) => [
          category._id,
          category.name,
        ]),
      ),
    [menu?.categories],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (menu?.items || []).filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [menu?.items, search, selectedCategory]);

  const changeCanteen = useCallback(() => {
    setMenu(null);
    setSelectedCanteen(null);
    setSelectedCategory("all");
    setSearch("");
    setCartOpen(false);
  }, []);

  if (loading) {
    return (
      <>
        <PublicHeader />
        <PageState
          loading
          title="Opening your canteen"
          message="Loading the latest available menu."
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PublicHeader />
        <PageState
          title={selectedCanteen ? "Menu unavailable" : "QR unavailable"}
          message={error}
          actionLabel="Try again"
          onAction={() =>
            selectedCanteen ? openCanteen(selectedCanteen) : loadOffice()
          }
        />
      </>
    );
  }

  if (!resolution?.canteens?.length) {
    return (
      <>
        <PublicHeader />
        <PageState
          title="No canteen available"
          message={isMasterQr
            ? "This canteen is not accepting master QR orders."
            : "There are no active canteens assigned to this office."}
        />
      </>
    );
  }

  if (!menu && !isMasterQr) {
    return (
      <>
        <PublicHeader />
        <CanteenSelection
          office={resolution.office}
          canteens={resolution.canteens}
          onSelect={(canteen) => openCanteen(canteen)}
        />
      </>
    );
  }

  return (
    <div className="ordering-app">
      <PublicHeader
        canChangeCanteen={!isMasterQr && resolution.canteens.length > 1}
        onChangeCanteen={changeCanteen}
      />

      <main className="menu-page page-container">
        <section className="menu-hero">
          <span className="menu-hero-icon">
            <MdStorefront />
          </span>
          <div>
            <span className="eyebrow">
              {isMasterQr ? "Direct canteen ordering" : resolution.office.companyName}
            </span>
            <h1>{menu.canteen.name}</h1>
            <p>
              <MdLocationOn />
              {menu.canteen.city} · {menu.canteen.openingTime}–
              {menu.canteen.closingTime}
            </p>
          </div>
        </section>

        <section className="browse-panel">
          <div className="search-box">
            <MdSearch />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dishes, snacks or drinks"
              aria-label="Search menu"
            />
          </div>

          <CategoryTabs
            categories={menu.categories || []}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        <section className="menu-section">
          <div className="menu-heading">
            <h2>Explore the menu</h2>
            <span>{filteredItems.length} items</span>
          </div>

          {filteredItems.length ? (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  categoryName={categoryNames[item.categoryId] || "Menu"}
                />
              ))}
            </div>
          ) : (
            <div className="empty-menu-state">
              <span>🍽️</span>
              <h3>No matching items</h3>
              <p>Try another category or search term.</p>
            </div>
          )}
        </section>
      </main>

      <FloatingCartButton
        itemCount={itemCount}
        subtotal={subtotal}
        onClick={() => setCartOpen(true)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutHandoff
        open={checkoutOpen}
        officeCode={normalizedOfficeCode}
        publicCode={normalizedPublicCode}
        isMasterQr={isMasterQr}
        canteen={selectedCanteen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(order) => {
          setCheckoutOpen(false);
          if (order?.trackingPath) {
            const trackingUrl = new URL(
              order.trackingPath,
              window.location.origin,
            );
            if (isMasterQr) {
              trackingUrl.searchParams.set("publicCode", normalizedPublicCode);
            } else {
              trackingUrl.searchParams.set("officeCode", normalizedOfficeCode);
            }
            if (!isMasterQr && selectedCanteen?._id) {
              trackingUrl.searchParams.set(
                "canteenId",
                selectedCanteen._id,
              );
            }
            navigate(`${trackingUrl.pathname}${trackingUrl.search}`, {
              replace: true,
            });
          } else {
            setPlacedOrder(order);
          }
        }}
      />

      {placedOrder && (
        <div className="modal-overlay success-overlay" role="presentation">
          <section
            className="order-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-success-title"
          >
            <span className="order-success-check" aria-hidden="true">✓</span>
            <span className="eyebrow">Order confirmed</span>
            <h2 id="order-success-title">Your order is with the canteen</h2>
            <p>Keep the order number handy while collecting your food.</p>
            <div className="order-number-card">
              <span>Order number</span>
              <strong>{placedOrder.orderNumber}</strong>
            </div>
            <div className="success-facts">
              <div><span>Total</span><strong>₹{placedOrder.grandTotal}</strong></div>
              <div><span>Status</span><strong>{placedOrder.orderStatus}</strong></div>
              <div>
                <span>Estimated time</span>
                <strong>
                  {placedOrder.estimatedPreparationTime > 0
                    ? `${placedOrder.estimatedPreparationTime} min`
                    : "Confirming"}
                </strong>
              </div>
            </div>
            <p className="payment-note">Pay directly to the canteen. No online payment was taken.</p>
            <button type="button" onClick={() => setPlacedOrder(null)}>
              Back to menu
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
