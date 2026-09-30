import apiClient from "../lib/apiClient";
import { PAYMENT_ADMIN_ENDPOINTS } from "../constants/payments";
import { assertAuthEnvelope } from "../utils/parseApiError";
import { normalizeCommissionConfiguration } from "../utils/normalizeCommissionConfiguration";

export async function fetchCommissionConfigurations() {
  const { data } = await apiClient.get(
    PAYMENT_ADMIN_ENDPOINTS.COMMISSION_CONFIGURATIONS,
  );
  const envelope = assertAuthEnvelope(
    data,
    "Could not load commission configuration.",
  );
  return normalizeCommissionConfiguration(envelope?.data ?? envelope);
}

function looksLikeConfiguration(record) {
  return Boolean(
    record &&
    typeof record === "object" &&
    (Array.isArray(record.vendors) ||
      Array.isArray(record.categories) ||
      record.defaultRate != null ||
      record.default_rate != null ||
      record.default_commission_rate != null),
  );
}

function savedConfiguration(envelope, fallbackMessage) {
  const record = envelope?.data;
  return {
    configuration: looksLikeConfiguration(record)
      ? normalizeCommissionConfiguration(record)
      : null,
    message: envelope?.reason || envelope?.message || fallbackMessage,
  };
}

export async function updateCommissionRate(defaultRate) {
  const payload = { default_rate: Number(defaultRate) };
  const { data } = await apiClient.patch(
    PAYMENT_ADMIN_ENDPOINTS.UPDATE_COMMISSION_RATE,
    payload,
  );
  const envelope = assertAuthEnvelope(
    data,
    "Could not update the commission rate.",
  );
  return savedConfiguration(envelope, "Commission rate updated.");
}

export async function updateVendorCommissionRate({ vendorId, rate }) {
  const payload = {
    vendor_id: String(vendorId),
    rate: Number(rate),
  };
  const { data } = await apiClient.patch(
    PAYMENT_ADMIN_ENDPOINTS.UPDATE_VENDOR_COMMISSION_RATE,
    payload,
  );
  const envelope = assertAuthEnvelope(
    data,
    "Could not update the vendor commission rate.",
  );
  return savedConfiguration(envelope, "Vendor commission rate updated.");
}

export async function updateCategoryCommissionRate({ categoryId, rate }) {
  const payload = {
    category_id: String(categoryId),
    rate: Number(rate),
  };
  const { data } = await apiClient.patch(
    PAYMENT_ADMIN_ENDPOINTS.UPDATE_CATEGORY_COMMISSION_RATE,
    payload,
  );
  const envelope = assertAuthEnvelope(
    data,
    "Could not update the category commission rate.",
  );
  return savedConfiguration(envelope, "Category commission rate updated.");
}
