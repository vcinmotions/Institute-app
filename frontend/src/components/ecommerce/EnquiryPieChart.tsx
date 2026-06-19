"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface EnquiryTargetProps {
  enquiries: any[];
  convertedCount: number;
  notConvertedCount: number;
}

export default function EnquiryTarget({
  enquiries,
  convertedCount,
  notConvertedCount,
}: EnquiryTargetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const series = [notConvertedCount, convertedCount];
  const totalCount = convertedCount + notConvertedCount;
  const conversionRate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;

  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "inherit",
    },
    labels: ["Not Converted", "Converted"],
    // ERP Clean operational branding colors (Slate/Blue matrix)
    colors: ["#64748b", "#0284c7"],
    stroke: {
      width: 1,
      colors: ["#ffffff"]
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: "600",
      }
    },
    tooltip: {
      x: { show: false },
      y: {
        // Displays exact numbers instead of arbitrary percentages for business accuracy
        formatter: (value: number) => `${value} Enquiries`,
      },
      style: {
        fontSize: "11px",
      },
    },
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 600,
      labels: {
        colors: "#475569", // Tailwind slate-600
        useSeriesColors: false,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4,
      },
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ERP Compact Card Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Enquiry Conversion Matrix
        </h3>

        <div className="relative inline-block h-4">
          <button onClick={toggleDropdown} type="button" className="p-0.5 rounded transition hover:bg-slate-50 dark:hover:bg-slate-900">
            <MoreDotIcon className="text-slate-400 hover:text-slate-600 dark:text-slate-500" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-36 rounded border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950 z-50"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60"
            >
              Export Dataset
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded px-2.5 py-1.5 text-left text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Reset Filters
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Analytics Plot Wrapper */}
      <div className="p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-[280px]">
          <ReactApexChart
            options={options}
            series={series}
            type="pie"
            height={220}
          />
        </div>
      </div>

      {/* ERP Statistical Status Meta Footer */}
      <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/10 text-center">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          <span className="font-bold text-slate-800 dark:text-slate-200">{conversionRate}%</span> of total pipeline inquiries converted to complete admissions this session cycle.
        </p>
      </div>
    </div>
  );
}