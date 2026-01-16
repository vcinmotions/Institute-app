// filters/enquiry.sort.ts

export function buildStudentOrderBy(
  sortField: string,
  sortOrder: "asc" | "desc"
) {

  if (sortField === "admissionDate") {
    return { admissionDate: sortOrder };
  }

  return { admissionDate: "desc" };
}
