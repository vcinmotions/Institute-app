import { Metadata } from "next";
import SourceForm from "../form/createSource";

export const metadata: Metadata = {
  title: "Create Source",
};

export default function CreateSource() {
  return (
    <SourceForm/>
  );
}