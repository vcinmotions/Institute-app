import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportAnalyticsToExcel = (summary: any, breakdown: any) => {
  // Create sheets for each dataset
  const workbook = XLSX.utils.book_new();

  // ✅ Summary sheet
  const summarySheet = XLSX.utils.json_to_sheet([summary]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // ✅ Breakdown sheets
  if (breakdown.perStudent)
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(breakdown.perStudent),
      "Per Student"
    );

  if (breakdown.perCourse)
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(breakdown.perCourse),
      "Per Course"
    );

  if (breakdown.perBatch)
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(breakdown.perBatch),
      "Per Batch"
    );

  if (breakdown.perFaculty)
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(breakdown.perFaculty),
      "Per Faculty"
    );

  if (breakdown.perPC)
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(breakdown.perPC),
      "Per PC"
    );

  // ✅ Export as Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Financial_Report_${new Date().toISOString()}.xlsx`);
};
