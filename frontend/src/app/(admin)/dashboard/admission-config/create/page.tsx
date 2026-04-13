import { Metadata } from "next";
import AdmissionConfigForm from "../form/createAdmissionConfig";

export const metadata: Metadata = {
  title: "Create Custom Admission Config",
};

export default function CreateAdmissionConfig() {
  return (
    <AdmissionConfigForm />
  );
}
