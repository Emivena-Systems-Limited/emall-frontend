import apiClient from "../lib/apiClient";
import { PAYMENT_ADMIN_ENDPOINTS } from "../constants/payments";
import { assertAuthEnvelope } from "../utils/parseApiError";
import { normalizeCommissionConfiguration } from "../utils/normalizeCommissionConfiguration";
import { composeFullName } from "../utils/profileUtils";

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

function historyText(...values) {
  for (const value of values) {
    if (value == null || typeof value === "object") continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function historyRate(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function historyList(envelope) {
  const data = envelope?.data ?? envelope;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

function changedByName(actor) {
  if (!actor || typeof actor !== "object") return historyText(actor);
  return (
    historyText(
      composeFullName(actor.first_name, actor.last_name),
      composeFullName(actor.firstName, actor.lastName),
      actor.name,
      actor.full_name,
      actor.fullName,
    ) || ""
  );
}

function normalizeHistoryItem(item, index) {
  const actor = item?.changed_by ?? item?.changedBy ?? item?.user ?? item?.admin;
  const name = changedByName(actor);
  const email =
    actor && typeof actor === "object"
      ? historyText(actor.email)
      : "";
  const at = historyText(
    item?.datetime,
    item?.at,
    item?.changed_at,
    item?.changedAt,
    item?.created_at,
    item?.createdAt,
  );

  return {
    id: historyText(item?.id, item?.uuid) || `${at}-${email}-${index}`,
    previousRate: historyRate(item?.previous_rate ?? item?.previousRate),
    newRate: historyRate(item?.new_rate ?? item?.newRate),
    appliedTo: historyText(item?.applied_to, item?.appliedTo).toLowerCase() === "default"
      ? "Marketplace default"
      : historyText(item?.applied_to, item?.appliedTo),
    changedByName: name,
    changedByEmail: email,
    at,
  };
}

function historyPagination(envelope, { page, perPage }) {
  const data = envelope?.data ?? envelope;
  const meta = data?.pagination && typeof data.pagination === "object" ? data.pagination : data;
  const lastPage = Number(meta?.last_page ?? meta?.lastPage ?? 1);
  const currentPage = Number(meta?.current_page ?? meta?.currentPage ?? page);
  const total = Number(meta?.total);
  const size = Number(meta?.per_page ?? meta?.perPage ?? perPage);

  return {
    page: Number.isFinite(currentPage) && currentPage > 0 ? currentPage : page,
    totalPages: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    perPage: Number.isFinite(size) && size > 0 ? size : perPage,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
  };
}

export async function fetchCommissionHistory({ page = 1, perPage = 20 } = {}) {
  const params = { page, per_page: perPage };
  const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.COMMISSION_HISTORY, { params });
  const envelope = assertAuthEnvelope(data, "Could not load commission history.");
  const records = historyList(envelope)
    .filter((item) => item && typeof item === "object")
    .map(normalizeHistoryItem);

  return {
    records,
    pagination: historyPagination(envelope, { page, perPage }),
  };
}
