import { Metadata } from "next";
import CompanyDashboard from "../(client-dashboard)/CompanyDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Home() {
  return <CompanyDashboard />;
}
