"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      fontWeight: 600,
      fontFamily: "inherit",
      labels: {
        colors: "#475569",
      },
      markers: {
        // width: 7,
        // height: 7,
        // radius: 2,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    colors: ["#0284c7", "#64748b"], // ERP Business Indigo Azure & Neutral Slate
    chart: {
      fontFamily: "inherit",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "straight", // ERP default straight layout style for precision reporting
      width: [1.5, 1.5],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 1.5,
      hover: {
        size: 4,
      },
    },
    grid: {
      borderColor: "#f1f5f9", // Subtle slate-100 grid borders
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
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: "light",
      style: {
        fontSize: "11px",
      },
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => new Intl.NumberFormat("en-IN").format(val),
      },
    },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: true,
        color: "#e2e8f0", // Clear slate-200 boundary line
      },
      axisTicks: {
        show: true,
        color: "#e2e8f0",
      },
      labels: {
        style: {
          fontSize: "10px",
          fontWeight: 500,
          colors: "#64748b",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "10px",
          colors: "#64748b",
        },
        formatter: (val: number) => new Intl.NumberFormat("en-IN").format(val),
      },
    },
  };

  const series = [
    {
      name: "Sales Volume",
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: "Gross Revenue",
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">

      {/* ERP Style Title & Toolbar Zone Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/60 shrink-0">
        <div className="min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Performance Statistics Analytics
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
            Target tracking matrices configured against current cycle months.
          </p>
        </div>

        {/* Dynamic Period Toggles */}
        <div className="flex items-center shrink-0 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      {/* Render Plot Area */}
      <div className="p-4 flex-1 max-w-full overflow-x-auto no-scrollbar">
        <div className="-ml-3 min-w-[850px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={290}
          />
        </div>
      </div>

    </div>
  );
}