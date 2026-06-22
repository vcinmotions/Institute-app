import { Metadata } from "next";
import AdmissionForm from "../form/createAdmission";

export const metadata: Metadata = {
  title: "Create Admission",
};

export default function CreateAdmission() {
  return (
    <AdmissionForm />
  );
}