import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="page-state">
    <span className="page-state-icon">404</span>
    <h1>Scan your office QR</h1>
    <p>This ordering page must be opened using a valid office QR code.</p>
    <Link to="/">Go back</Link>
  </main>
);

export default NotFoundPage;
