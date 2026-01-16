export function buildPaymentOrderBy(
  sortField: "paymentDate",
  sortOrder: "asc" | "desc"
) {
  return {
    [sortField]: sortOrder,
  };
}
