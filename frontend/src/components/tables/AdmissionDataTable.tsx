
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useSelector } from "react-redux";
import Button from "../ui/button/Button";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import Avatar from "../common/Avatar";
import { STATUS_COLOR_MAP } from "../common/BadgeStatus";


type AdmissionDataTableProps = {
  admissions: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function AdmissionDataTable({
  admissions,
  loading,
  onSort,
  sortField,
  sortOrder,
}: AdmissionDataTableProps) {
  const router = useRouter();
  // const [selectedId, setSelectedId] = useState<string | null>(null);
  const admission = useSelector(
    (state: RootState) => state.admission.admissions,
  );

  console.log(
    "Get Enquiries to Proceed With Admission:",
    admission,
  );

  const handleEditAdmission = (id: string) => {
    // router.push(`/dashboard/admission/edit/${id}`);
    router.push(`/dashboard/admission/edit?id=${id}`);
  };

  // const handleAdmission = (id: any) => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //     console.error("No token found in sessionStorage");
  //     return;
  //   }

  //   console.log("Get EnquiryId to Admission Handle:", id);

  //   const enquiryData = enquiries.find((item) => item.id === id);

  //   console.log("Get Enquity Data in Handle Admission:", enquiryData);

  //   if (!enquiryData) {
  //     console.error("No enquiry data found for this ID");
  //     return;
  //   }

  //   const { name, email, contact, courseId } = enquiryData;

  //   // ✅ Save ID and data to state
  //   setSelectedEnquiryId(id);
  //   setSelectedEnquiryData({ name, email, contact, courseId });

  //   console.log("Get Enquiry Id in HandleAdmission:", selectedEnquiryId);
  //   console.log("Get Enquiry DATA in HandleAdmission:", selectedEnquiryData);
  //   setShowAdmissionForm(true);
  // };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[500px] min-w-[1102px] overflow-y-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Enquiry
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Email
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Course
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("createdAt")}
                  >
                    Created At
                    <span>
                      {sortField === "createdAt" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Admission
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {admission && admission.length > 0 ? (
                admission.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <Avatar name={item.name} size={38} />
                        </div>
                        <div>
                          <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email ? item.email : "-"}
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.contact ? item.contact.split('+91')[1] : "-"}
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.enquiryCourse.map((cr: any, index: number) => (
                        <span key={index}>{cr.course.name}</span>
                      ))}
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={STATUS_COLOR_MAP[item.leadStatus] ?? "error"}
                      >
                        {item.leadStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleEditAdmission(item.id)}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Admission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Admission found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
