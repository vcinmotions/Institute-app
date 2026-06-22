import { Metadata } from "next";
import EditTestForm from "../form/editTest";

export const metadata: Metadata = {
    title: "Edit Test",
};

export default function EditTest() {
    return (
        <EditTestForm />
    );
}