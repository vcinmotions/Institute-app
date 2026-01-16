"use client";
import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useCourseCompletion } from "@/hooks/useCourseCompletion";
import TextArea from "../input/TextArea";

interface CourseCompletionFormProps {
  onCloseModal: () => void;
  studentId: string;
  studentCourseId: string;
}

interface CourseCompletionData {
  feedback: string;
  remark: string;
}

export default function CourseCompletionForm({
  onCloseModal,
  studentId,
  studentCourseId,
}: CourseCompletionFormProps) {
  const [formData, setFormData] = useState<CourseCompletionData>({
    feedback: "",
    remark: "",
  });
    const [errors, setErrors] = useState<Partial<CourseCompletionData>>({});
  
  const { mutate: courseCompletion } = useCourseCompletion();

  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    variant: string;
  }>({
    show: false,
    title: "",
    message: "",
    variant: "",
  });

  console.log("get StudentId and StudentCourseId:", studentId, studentCourseId);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // ✅ Mutation to call backend
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token not available");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/  `,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAlert({
        show: true,
        title: "Course Completed",
        message: data.message || "Course marked as completed successfully.",
        variant: "success",
      });
      setTimeout(() => {
        onCloseModal();
      }, 2000);
    },
    onError: (error: any) => {
      setAlert({
        show: true,
        title: "Error",
        message:
          error.response?.data?.error || "Something went wrong. Try again.",
        variant: "error",
      });
    },
  });

  const handleChange = (field: keyof CourseCompletionData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {

    const validationErrors: Partial<CourseCompletionData> = {};

    if (!formData.remark.trim()) validationErrors.remark = "Remark is required.";
    if (!formData.feedback.trim()) validationErrors.feedback = "Feedback is required.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter at least feedback or remark.",
        variant: "error",
      });

        // ✅ FIXED setTimeout
    setTimeout(() => {
      setErrors({});
      setAlert({ show: false, title: "", message: "", variant: "" });
    }, 2000);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setAlert({
        show: true,
        title: "Unauthorized",
        message: "Token not found. Please log in again.",
        variant: "error",
      });

      // ❌ Hide token error after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return;
    }

    const payload = {
      token,
      studentId,
      studentCourseId,
      feedback: formData.feedback,
      remark: formData.remark,
    };

    try {
      await courseCompletion(payload);
      setAlert({
        show: true,
        title: "Course Completion Done",
        message: "Course marked as completed successfully.",
        variant: "success",
      });

      // ✅ Close modal after 3s
      setTimeout(() => {
        onCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Error in Course Completion", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Something went wrong while completing the course.",
        variant: "error",
      });

      // ❌ Hide server error alert after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);
    }
  };

  return (
    <ModalCard title="Course Completion Form" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}
        <div>

        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Feedback
        </label>

        <TextArea
          value={formData.feedback}
          ref={firstInputRef}
          tabIndex={1}
          className="w-full capitalize rounded border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          onChange={(value) => handleChange("feedback", value)}
          rows={4}
          placeholder="Interview Follow-Up Schedule"
        />
        {errors.remark && (
            <p className="text-sm text-red-500">{errors.remark}</p>
          )}
          </div>

          <div>

        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Remark
        </label>
        {/* <textarea
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm dark:bg-gray-900 text-black dark:text-white placeholder:text-gray-500"
          value={formData.remark}
          placeholder="Enter remarks or additional notes"
          onChange={(e) => handleChange("remark", e.target.value)}
        /> */}

        <TextArea
          tabIndex={2}
          value={formData.remark}
          className="w-full capitalize rounded border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          onChange={(value) => handleChange("remark", value)}
          rows={4}
          placeholder="Interview Follow-Up Schedule"
        />
        {errors.feedback && (
            <p className="text-sm text-red-500">{errors.feedback}</p>
          )}
</div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={3}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
            tabIndex={4}
            variant="primary"  
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
