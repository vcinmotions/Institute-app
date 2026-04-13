import { Metadata } from "next";
import RoleProtected from "@/components/auth/RoleProtected";
import AdmissionConfigPage from "../../(ui-elements)/admission-config/page";


export const metadata: Metadata = {
  title: "Admission-config",
};

export default function Enquiry() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <AdmissionConfigPage />
    </RoleProtected>
  );
}
