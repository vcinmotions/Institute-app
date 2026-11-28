import { Metadata } from "next";
import LabForm from "../../lab/form/createLab";

export const metadata: Metadata = {
  title: "Create Class",
};

export default function CreateClass() {
  return <LabForm kind="CLASS" />;
}
