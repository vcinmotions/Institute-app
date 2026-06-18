"use client";
import { Button } from "@heroui/react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { exportAnalyticsToExcel } from "@/app/utils/exportToExcel";

interface EcommerceMetricsProps {
  summary: {
    totalIncome?: number;
    totalPCIncome?: number;
    totalStudentIncome?: number;
    totalCourseIncome?: number;
    totalFacultyIncome?: number;
    totalBatchIncome?: number;
    totalPCs?: number;
    totalOutstanding?: number;
  };
  breakdown: any;
  user: any;
}

export const EcommerceMetrics = ({ user, summary, breakdown }: EcommerceMetricsProps) => {

  console.log("Get SUMMARY AND BREAKDOWN IN ECOMMARECE:", summary, breakdown);
  return (
    <div className=" bg-white/[0.03] border border-gray-900/[0.09] rounded-2xl px-6 py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Income By Students
              </span>
              {/* Income By Students */}
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {new Intl.NumberFormat('en-IN').format(summary?.totalStudentIncome || 0)} INR
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              11.01%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Income By Course
              </span>
              {/* Income By Course */}
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {new Intl.NumberFormat('en-IN').format(summary?.totalCourseIncome || 0)} INR
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              11.01%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Income By Batches
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {summary.totalBatchIncome
              ? new Intl.NumberFormat('en-IN').format(summary.totalBatchIncome)
              : 0} INR
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div> */}
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Income By Faculty
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {summary.totalFacultyIncome
              ? new Intl.NumberFormat('en-IN').format(summary.totalFacultyIncome)
              : 0} INR
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge>
        </div>
      </div> */}
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Outstanding
              </span>
              {/* Total Outstanding */}
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {new Intl.NumberFormat('en-IN').format(summary?.totalOutstanding || 0)} INR
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon className="text-error-500" />
              9.05%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Income
              </span>
              {/* Total Income */}
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {new Intl.NumberFormat('en-IN').format(summary?.totalIncome || 0)} INR
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon className="text-error-500" />
              9.05%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}
        {/* {user.role === "ADMIN" && (
          <Button
            onClick={() => exportAnalyticsToExcel(summary, breakdown)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
          >
            Export to Excel
          </Button>
        )} */}
      </div>
    </div>
  );
};
