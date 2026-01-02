"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { getAnalytics, getEnquiry, getUser } from "@/lib/api";
import {
  setEnquiries,
  setError,
  setTotal,
  setTotalConverted,
  setTotalNotConverted,
} from "@/store/slices/enquirySlice";
import {
  setAnalytics,
  setAnalyticsBreakdown,
} from "@/store/slices/analyticsSlice";
import { exportAnalyticsToExcel } from "@/app/utils/exportToExcel";

// ⭐ Dynamic Imports
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import Button from "@/components/ui/button/Button";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import FinancialReport from "@/components/common/FinancialReport";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import EnquiryTarget from "@/components/ecommerce/EnquiryPieChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
//const EcommerceMetrics = dynamic(() => import("@/components/ecommerce/EcommerceMetrics"));

export default function Ecommerce() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const enquiries = useSelector((state: RootState) => state.enquiry.enquiries);
  const summary = useSelector((state: RootState) => state.analytic.summary);
  const breakdown = useSelector((state: RootState) => state.analytic.breakdown);
  const totalConverted = useSelector(
    (state: RootState) => state.enquiry.totalConverted,
  );
  const totalNotConverted = useSelector(
    (state: RootState) => state.enquiry.totalNotConverted,
  );

  console.log("GET USER DTA IN ECOMMERCE:", user);

  // 1️⃣ Fetch user & role
  useEffect(() => {
    const fetchUserAndData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        //const data = await getUser(token);
        const role = user?.role || null;
        setUserRole(role);

        if (role === "ADMIN") {
          const response = await getEnquiry({
            token,
            page: 1,
            limit: 5,
            search: "",
          });
          const responseAnalytics = await getAnalytics(token);

          dispatch(setAnalytics(responseAnalytics.summary || {}));
          dispatch(setAnalyticsBreakdown(responseAnalytics.breakdown || {}));
          dispatch(setEnquiries(response.enquiry || []));
          dispatch(setTotalConverted(response.convertedCount || 0));
          dispatch(setTotalNotConverted(response.notConvertedCount || 0));
          dispatch(setTotal(response.totalPages * 5 || 0));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        dispatch(setError("Failed to fetch data"));
      } finally {
        setLoading(false); // ✅ Only stop loading when all data is ready
      }
    };

    fetchUserAndData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics summary={summary} breakdown={breakdown} />
        {userRole === "ADMIN" && (
          <Button
            onClick={() => exportAnalyticsToExcel(summary, breakdown)}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Export to Excel
          </Button>
        )}
        {userRole === "ADMIN" && <FinancialReport />}
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-5">
        <MonthlyTarget />
        {userRole === "ADMIN" && (
          <EnquiryTarget
            enquiries={enquiries}
            convertedCount={totalConverted}
            notConvertedCount={totalNotConverted}
          />
        )}
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
