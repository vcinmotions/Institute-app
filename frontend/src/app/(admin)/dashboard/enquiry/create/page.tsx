import { Metadata } from "next";
import EnquiryForm from "../form/createEnquiry";

export const metadata: Metadata = {
  title: "Create Enquiry",
};

export default function CreateEnquiry() {
  return (
    <EnquiryForm/>
  );
}
