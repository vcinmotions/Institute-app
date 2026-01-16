export function buildStudentCoursesOrderBy(
  sortField: "startDate" | "endDate",
  sortOrder: "asc" | "desc"
) {
  return {
    [sortField]: sortOrder,
  };
}
