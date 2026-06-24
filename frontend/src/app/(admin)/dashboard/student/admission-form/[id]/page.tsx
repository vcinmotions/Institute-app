"use client";


import StudentForm from "@/components/form/form-elements/StudentForm";
import { useFetchStudentById } from "@/hooks/queries/useQueryFetchStudent";
import { RootState } from "@/store";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";

export default function AdmissionFormPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const params = useParams();

    const studentId = params.id as string;

    const token =
        typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null;

    const { data, isLoading, error } = useFetchStudentById({
        token,
        studentId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !data) {
        return <div>Student not found</div>;
    }

    return (
        <StudentForm
            studentData={data}
            companyDetails={user}
        />
    );
}