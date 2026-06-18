import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { useState } from "react";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { Tooltip } from "@heroui/react";
import { TASK_STATUS } from "../common/BadgeStatus";
import EditTestForm from "../form/form-elements/EditTestForm";

type TestDataTableProps = {
    tests: any[];
    batch: any[];
    loading: boolean;
};

export default function TestDataTable({
    tests,
    batch,
    loading,
}: TestDataTableProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [testDetail, setTestDetail] = useState(false);
    const [testData, setTestData] = useState<any>(null);

    const handleCloseModal = () => {
        setSelectedId(null);
        setTestDetail(false);
        setTestData(null);
    };

    const handleEditLab = (item: any) => {
        setSelectedId(item.id);
        setTestDetail(true);
        setTestData(item);
    };

    const handlePublish = (item: any) => {
        // TODO: wire to actual publish mutation/endpoint
        console.log("Publish requested for test:", item.id);
    };

    return (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="max-w-full overflow-x-auto">
                <div className="max-h-[550px] min-w-[640px] overflow-y-auto">
                    <Table className="w-full table-fixed border-collapse text-left">
                        {/* ERP Style Table Header */}
                        <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
                            <TableRow>
                                <TableCell isHeader className="h-9 w-[26%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Test Name
                                </TableCell>
                                <TableCell isHeader className="h-9 w-[16%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Batch
                                </TableCell>
                                <TableCell isHeader className="h-9 w-[18%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Course
                                </TableCell>
                                <TableCell isHeader className="h-9 w-[14%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="h-9 w-[16%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Publish
                                </TableCell>
                                <TableCell isHeader className="h-9 w-[10%] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Edit
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* High Density Data Cells */}
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {tests && tests.length > 0 ? (
                                tests.map((item: any) => (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                                    >
                                        <TableCell className="px-3 py-1.5">
                                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize truncate block">
                                                {item.name}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 truncate">
                                            {item.batch?.name || "-"}
                                        </TableCell>

                                        <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 truncate">
                                            {item.course?.name || "-"}
                                        </TableCell>

                                        <TableCell className="px-3 py-1.5">
                                            <Badge
                                                size="sm"
                                                color={TASK_STATUS[item.status] ?? "error"}
                                            >
                                                {item.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-3 py-1.5">
                                            <Button
                                                onClick={() => handlePublish(item)}
                                                disabled
                                                size="sm"
                                                allowedRoles={["ADMIN", "FACULTY", "ACCOUNTANT"]}
                                                className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                Publish
                                            </Button>
                                        </TableCell>

                                        <TableCell className="px-3 py-1.5">
                                            <Tooltip
                                                className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5"
                                                content="Edit Test"
                                            >
                                                <button
                                                    className="rounded p-0.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                                    onClick={() => handleEditLab(item)}
                                                >
                                                    <svg
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                                    >
                                        No Test found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedId !== null && testDetail === true && (
                <EditTestForm onCloseModal={handleCloseModal} testData={testData} />
            )}
        </div>
    );
}