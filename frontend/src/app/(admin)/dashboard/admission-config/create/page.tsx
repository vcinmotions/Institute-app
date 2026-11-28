import { Metadata } from "next";
import RoleProtected from "@/components/auth/RoleProtected";
import AdmissionConfigForm from "../form/createAdmissionConfig";

export const metadata: Metadata = {
  title: "Create Custom Admission Config",
};

export default function CreateAdmissionConfig() {
  return (
    <RoleProtected allowedRoles={["ADMIN"]} adminOnly>
      <AdmissionConfigForm />
    </RoleProtected>
  );
}
