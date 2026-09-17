import { MdQrCodeScanner, MdRefresh } from "react-icons/md";

const PageState = ({
  loading = false,
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <main className="page-state" role={loading ? "status" : undefined}>
    {loading ? (
      <span className="page-loader" aria-label="Loading" />
    ) : (
      <span className="page-state-icon">
        <MdQrCodeScanner />
      </span>
    )}
    <h1>{title}</h1>
    {message && <p>{message}</p>}
    {onAction && (
      <button type="button" onClick={onAction}>
        <MdRefresh />
        {actionLabel || "Try again"}
      </button>
    )}
  </main>
);

export default PageState;
