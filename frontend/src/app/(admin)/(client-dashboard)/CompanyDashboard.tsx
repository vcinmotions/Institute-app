"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { getAnalytics, getEnquiry, getStudent, getUser } from "@/lib/api";
import {
  setCurrentPage,
  setEnquiries,
  setError,
  setTotal,
  setTotalConverted,
  setTotalNotConverted,
} from "@/store/slices/enquirySlice";
import {
  setAnalytics,
  setAnalyticsBreakdown,
  setBirthdays,
  setMonthlySales,
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
import { PAGE_SIZE } from "@/constants/pagination";
import MonthlyBirthdayCard from "@/components/ecommerce/MonthlyBirthdayCard";
import { useFetchEnquiry } from "@/hooks/queries/useQueryFetchEnquiry";
import { useFetchStudent } from "@/hooks/queries/useQueryFetchStudent";
import { setBirthday } from "@/store/slices/studentSlice";

export default function CompanyDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const enquiries = useSelector((state: RootState) => state.enquiry.enquiries);
  const birthday = useSelector((state: RootState) => state.student.birthday);
  const summary = useSelector((state: RootState) => state.analytic.summary);
  const breakdown = useSelector((state: RootState) => state.analytic.breakdown);
  const birthdays = useSelector((state: RootState) => state.analytic.birthdays);
  const monthlySales = useSelector((state: RootState) => state.analytic.monthlySales);
  const totalConverted = useSelector(
    (state: RootState) => state.enquiry.totalConverted,
  );
  const totalNotConverted = useSelector(
    (state: RootState) => state.enquiry.totalNotConverted,
  );

  console.log("GET USER DTA IN ECOMMERCE:", user);

  const { data, isLoading } = useFetchEnquiry({
    token
  });

  const { data: student } = useFetchStudent({
    token
  });

  console.log("ENQUIRIES IN DASHBOARD:", data);


  useEffect(() => {
    console.log("useFetchEnquiry TRIGGERED IN ENQUIRY-TABLE", data)
    if (data) {
      dispatch(setEnquiries(data.data || []));
      dispatch(setTotal(data.total || 0));
      dispatch(setTotalConverted(data.convertedCount || 0));
      dispatch(setTotalNotConverted(data.notConvertedCount || 0));
    }
  }, [data, dispatch]);

  useEffect(() => {
    console.log("useFetchEnquiry TRIGGERED IN ENQUIRY-TABLE", data)
    if (student) {
      dispatch(setBirthday(student.birthday || []));
    }
  }, [student, dispatch]);

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
          const responseAnalytics = await getAnalytics(token);


          dispatch(setAnalytics(responseAnalytics.summary || {}));
          dispatch(setAnalyticsBreakdown(responseAnalytics.breakdown || {}));
          dispatch(setMonthlySales(responseAnalytics.monthlySales || {}));

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
        <EcommerceMetrics user={user} summary={summary} breakdown={breakdown} />

        {userRole === "ADMIN" && <FinancialReport />}
        <MonthlySalesChart monthlySales={monthlySales} />
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
        <MonthlyBirthdayCard birthdays={birthday}
          convertedCount={totalConverted}
          notConvertedCount={totalNotConverted} />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}