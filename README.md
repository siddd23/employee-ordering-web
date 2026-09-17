# CanteenFlow Employee Ordering Web

A dedicated mobile-first React website for employees opening an office QR code.

## Current functionality

- Resolves and validates an office QR without login.
- Opens the menu automatically when one canteen is assigned.
- Shows a responsive canteen picker when multiple canteens are assigned.
- Loads only active categories and available items from the public API.
- Supports menu search and category filtering.
- Provides food images with graceful fallbacks.
- Supports vegetarian/non-vegetarian indicators and preparation time.
- Provides a persistent cart scoped by `officeCode + canteenId`.
- Includes responsive quantity controls, floating cart and accessible cart drawer.
- Collects employee name, mobile number and optional preparation instructions.
- Places a real order using backend-validated menu items and server-calculated prices.
- Shows the confirmed order number, amount, status and preparation estimate.
- Prevents repeat submission and clears the cart only after successful creation.
- Handles loading, invalid QR, inactive office, empty menu and API errors.

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The default development URL is:

```text
http://localhost:3000
```

Set the backend API in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Open a real office QR route:

```text
http://localhost:3000/order/OFC-8F2A10BC
```

Replace the example code with an actual office code from MongoDB.

## Backend APIs used

```http
GET /api/public/offices/:officeCode
GET /api/public/offices/:officeCode/canteens/:canteenId/menu
POST /api/public/orders
```

## Quality checks

```powershell
npm run lint
npm run build
```

Both checks passed when the project was packaged.

## Next module

Connect the Flutter owner dashboard to protected order-management APIs for
accepting, rejecting and delivering orders, then record Paid or Pay Later status.
# Employee live order tracking

After a successful checkout, the app now opens the secure tracking path returned by the backend. The tracking page displays order progress, items, amount, payment status, and estimated preparation time. It refreshes every five seconds while the tab is visible and stops when the order is Delivered, Rejected, or Cancelled.

This React update requires the matching backend tracking module because older backend responses do not contain `trackingPath` or `trackingToken`.
