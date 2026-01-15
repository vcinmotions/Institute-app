// filters/enquiry.sort.ts
export function buildEnquiryOrderBy(
  sortField: string,
  sortOrder: "asc" | "desc"
) {
  if (sortField === "srNo") {
    return { srNo: sortOrder };
  }

  if (sortField === "createdAt") {
    return { createdAt: sortOrder };
  }

  return { createdAt: "desc" };
}
