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

export default function MonthlySalesChart({ monthlySales }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const monthsOrder = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];

  const monthMap: Record<string, number> = {};

  // convert [{mar:3},{feb:1}] → {mar:3,feb:1}
  if (Array.isArray(monthlySales)) {
    monthlySales.forEach((item: any) => {
      const key = Object.keys(item)[0];
      monthMap[key] = item[key];
    });
  }

  // create 12 month array
  const chartData = monthsOrder.map(month => monthMap[month] || 0);

  const options: ApexOptions = {
    colors: ["#0284c7"], // Clean ERP corporate blue
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 2, // Tighter ERP corner radius
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: true,
        color: "#e2e8f0", // slate-200 border lines
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "10px",
          fontWeight: 500,
          colors: "#64748b",
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "10px",
          colors: "#64748b",
        },
        formatter: (val: number) => new Intl.NumberFormat("en-IN").format(val),
      }
    },
    legend: {
      show: false, // Internal single-metric views drop legends to save real estate
    },
    grid: {
      borderColor: "#f1f5f9", // slate-100 very subtle lines
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${new Intl.NumberFormat("en-IN").format(val)} Sales`,
      },
      style: {
        fontSize: "11px",
      }
    },
  };

  const series = [
    {
      name: "Sales Volume",
      data: chartData,
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">

      {/* ERP Compact Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Monthly Performance Trends
          </h3>
        </div>

        <div className="relative inline-block h-4">
          <button
            onClick={toggleDropdown}
            type="button"
            className="p-0.5 rounded transition hover:bg-slate-50 dark:hover:bg-slate-900"
          >
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
          </Dropdown>
        </div>
      </div>

      {/* Metric Visual Graph Canvas Zone */}
      <div className="p-3.5 flex-1 max-w-full overflow-x-auto no-scrollbar">
        <div className="-ml-3 min-w-[550px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={175}
          />
        </div>
      </div>

    </div>
  );
}