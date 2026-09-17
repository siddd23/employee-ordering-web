import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MdCheck,
  MdClose,
  MdOutlineAccountBalanceWallet,
  MdOutlineReceiptLong,
  MdRefresh,
  MdRestaurant,
  MdSchedule,
  MdTaskAlt,
} from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";

import PageState from "../components/common/PageState";
import PublicHeader from "../components/layout/PublicHeader";
import { getApiError } from "../services/api";
import { getPublicOrderTracking } from "../services/publicOrderingService";

const FINAL_STATUSES = new Set(["Delivered", "Rejected", "Cancelled"]);
const PROGRESS_STATUSES = ["Pending", "Accepted", "Delivered"];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));

const OrderTrackingPage = () => {
  const { orderNumber = "" } = useParams();
  const [searchParams] = useSearchParams();
  const trackingToken = searchParams.get("token") || "";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(
    async ({ signal, silent = false } = {}) => {
      if (!orderNumber || !trackingToken) {
        setError("This order tracking link is incomplete.");
        setLoading(false);
        return;
      }

      if (!silent) setRefreshing(true);
      try {
        const data = await getPublicOrderTracking({
          orderNumber,
          trackingToken,
          signal,
        });
        setOrder(data);
        setError("");
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED") return;
        if (!silent) {
          setError(
            getApiError(requestError, "Unable to load this order right now."),
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [orderNumber, trackingToken],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadOrder({ signal: controller.signal });
    return () => controller.abort();
  }, [loadOrder]);

  useEffect(() => {
    if (!order || FINAL_STATUSES.has(order.orderStatus)) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadOrder({ silent: true });
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadOrder, order]);

  const progressIndex = useMemo(
    () => Math.max(0, PROGRESS_STATUSES.indexOf(order?.orderStatus)),
    [order?.orderStatus],
  );

  if (loading && !order) {
    return (
      <>
        <PublicHeader />
        <PageState loading title="Finding your order" message="Loading its latest status." />
      </>
    );
  }

  if (error && !order) {
    return (
      <>
        <PublicHeader />
        <PageState
          title="Tracking unavailable"
          message={error}
          actionLabel="Try again"
          onAction={() => loadOrder()}
        />
      </>
    );
  }

  const isStopped = ["Rejected", "Cancelled"].includes(order.orderStatus);
  const isFinal = FINAL_STATUSES.has(order.orderStatus);

  return (
    <div className="tracking-app">
      <PublicHeader />
      <main className="tracking-page page-container">
        <section className={`tracking-hero ${isStopped ? "tracking-stopped" : ""}`}>
          <div className="tracking-hero-icon">
            {isStopped ? <MdClose /> : order.orderStatus === "Delivered" ? <MdTaskAlt /> : <MdRestaurant />}
          </div>
          <span className="eyebrow">Live order status</span>
          <h1>{order.orderStatus}</h1>
          <strong className="tracking-order-number">{order.orderNumber}</strong>
          <p>{order.canteenSnapshot?.name} · {order.officeSnapshot?.companyName}</p>
          {!isFinal && Number(order.estimatedPreparationTime) > 0 && (
            <span className="tracking-estimate">
              <MdSchedule /> Estimated preparation: {order.estimatedPreparationTime} min
            </span>
          )}
        </section>

        {isStopped ? (
          <section className="tracking-alert" role="status">
            <MdClose />
            <span>
              {order.orderStatus === "Rejected"
                ? "The canteen could not accept this order."
                : "This order has been cancelled."}
            </span>
          </section>
        ) : (
          <section className="tracking-card tracking-progress" aria-label="Order progress">
            {PROGRESS_STATUSES.map((status, index) => (
              <div className="tracking-progress-part" key={status}>
                <span className={index <= progressIndex ? "completed" : ""}>
                  {index < progressIndex ? <MdCheck /> : index === 0 ? <MdSchedule /> : index === 1 ? <MdRestaurant /> : <MdTaskAlt />}
                </span>
                <strong>{status}</strong>
                {index < PROGRESS_STATUSES.length - 1 && (
                  <i className={index < progressIndex ? "completed" : ""} />
                )}
              </div>
            ))}
          </section>
        )}

        <section className="tracking-card">
          <div className="tracking-card-title">
            <MdOutlineReceiptLong />
            <h2>Order items</h2>
          </div>
          <div className="tracking-items">
            {(order.items || []).map((item) => (
              <div key={`${item.menuItemId}-${item.name}`}>
                <span>{item.quantity} × {item.name}</span>
                <strong>{formatMoney(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="tracking-total">
            <span>{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</span>
            <strong>{formatMoney(order.grandTotal)}</strong>
          </div>
        </section>

        <section className="tracking-card tracking-payment">
          <MdOutlineAccountBalanceWallet />
          <div>
            <span>Payment status</span>
            <small>No online payment was taken</small>
          </div>
          <strong>{order.paymentStatus}</strong>
        </section>

        <button
          type="button"
          className="tracking-refresh"
          onClick={() => loadOrder()}
          disabled={refreshing}
        >
          <MdRefresh className={refreshing ? "refresh-spinning" : ""} />
          {refreshing ? "Refreshing..." : "Refresh status"}
        </button>
        <p className="tracking-auto-refresh">
          {isFinal
            ? "Final status received"
            : "This page refreshes automatically every 5 seconds"}
        </p>
      </main>
    </div>
  );
};

export default OrderTrackingPage;
