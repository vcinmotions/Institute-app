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
  birthdays: any[];
}

export default function MonthlyBirthdayCard({
  birthdays,
}: EnquiryTargetProps) {
  const [isOpen, setIsOpen] = useState(false);

  console.log(
    "Monthly Birthdays:",
    birthdays,
  );

  console.log("TODAYS DATE:", new Date());

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
    <div className="overflow-hidden rounded-2xl h-[350px] border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          🎂 Today's Birthdays
        </h3>
      </div>

      <div className="overflow-y-auto">
        <div className="mt-4 space-y-3">
          {birthdays && birthdays.length > 0 ? (
            birthdays.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {student.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    🎉 {new Date(student.dob).toLocaleDateString()}
                  </p>
                </div>

                <span className="text-sm text-blue-600 font-medium">
                  {student.studentCode}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No birthdays today 🎈
            </p>
          )}
        </div>
      </div>


      <div className="custom-scrollbar max-w-full overflow-x-auto">
        {/* Footer note */}
        <p className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {birthdays.length} Birthday Today.
        </p>
      </div>
    </div>
  );
}
