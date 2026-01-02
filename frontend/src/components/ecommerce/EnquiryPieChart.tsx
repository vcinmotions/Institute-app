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

  // const converted = 45;
  // const notConverted = 55;

  //  const convertedCount = enquiries.filter(e => e.isConverted && e.studentId !== null).length;
  // const notConvertedCount = enquiries.length - convertedCount;

  console.log(
    "Get convertedCount and notConvertedCount length:",
    convertedCount,
    notConvertedCount,
  );

  const series = [notConvertedCount, convertedCount];

  //const series = [notConverted, converted]; // false, true
  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "Outfit, sans-serif",
    },
    labels: ["Not Converted", "Converted"],
    colors: ["#465fff", "#46c8ff"],

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (value: number) => `${value}%`,
      },
      style: {
        fontSize: "14px",
        fontFamily: "Outfit, sans-serif",
      },
    },

    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 500,
      labels: {
        colors: "#6B7280", // Tailwind gray-500
        useSeriesColors: false,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Total Sales
        </h3>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="pie"
            height={300}
          />
        </div>
        {/* Footer note */}
        <p className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {convertedCount}% of inquiries were converted to Admission this month.
        </p>
      </div>
    </div>
  );
}
