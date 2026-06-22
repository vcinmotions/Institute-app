import { Metadata } from "next";
import TestForm from "../form/createTest";

export const metadata: Metadata = {
  title: "Create Test",
};

export default function CreateTest() {
  return (
    <TestForm />
  );
}