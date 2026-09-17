import api from "./api";

export const resolveOffice = async (officeCode, signal) => {
  const normalizedCode = String(officeCode || "").trim().toUpperCase();
  const response = await api.get(
    `/public/offices/${encodeURIComponent(normalizedCode)}`,
    { signal },
  );
  return response.data?.data;
};

export const getPublicMenu = async ({ officeCode, canteenId, signal }) => {
  const normalizedCode = String(officeCode || "").trim().toUpperCase();
  const response = await api.get(
    `/public/offices/${encodeURIComponent(normalizedCode)}` +
      `/canteens/${encodeURIComponent(canteenId)}/menu`,
    { signal },
  );
  return response.data?.data;
};

export const placePublicOrder = async (payload) => {
  const response = await api.post("/public/orders", payload);
  return response.data?.data?.order;
};

export const getPublicOrderTracking = async ({
  orderNumber,
  trackingToken,
  signal,
}) => {
  const response = await api.get(
    `/public/orders/${encodeURIComponent(orderNumber)}/track`,
    {
      params: { token: trackingToken },
      signal,
    },
  );
  return response.data?.data?.order;
};
