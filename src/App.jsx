import { Navigate, Route, Routes } from "react-router-dom";

import NotFoundPage from "./pages/NotFoundPage";
import OrderPage from "./pages/OrderPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

function App() {
  return (
    <Routes>
      <Route path="/order/:officeCode" element={<OrderPage />} />
      <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/" element={<Navigate to="/404" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
