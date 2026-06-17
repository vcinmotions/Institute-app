"use client";

import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateCompleteFollowUp } from "@/hooks/useCompleteFollowUp";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import TextArea from "../input/TextArea";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useScrollToError } from "@/app/utils/ScrollToError";

interface CreateFollowUpModalProps {
  onClose: () => void;
  title: string;
  enquiryId: string | null; // optional usage
}

interface FollowUpData {
  remark: string;
  scheduledAt: string;
}

export default function CompleteFollowUpModal({
  onClose,
  title,
  enquiryId,
}: CreateFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  // scheduledAt kept in state/interface as per original, though not rendered in this specific modal
  const [scheduledAt, setScheduledAt] = useState<string>(""); 
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  
  const { refetch } = useFollowUp(enquiryId);
  const { mutate: createCompleteFollowUp } = useCreateCompleteFollowUp();
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);

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

  console.log("Creating follow-up for Enquiry ID:", enquiryId);

  const firstInputRef = useRef<HTMLInputElement>(null);
  const { inputRefs, scrollToError } = useScrollToError();

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors: Partial<FollowUpData> = {};
    if (!remark.trim()) newErrors.remark = "Remark is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required fields.",
        variant: "error",
      });

      scrollToError(validationErrors);

      setTimeout(() => {
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

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return;
    }

    if (!enquiryId) return;

    createCompleteFollowUp(
      { enquiryId, remark, currentPage },
      {
        onSuccess: async () => {
          setRemark("");
          setErrors({});

          // Refetch follow-ups
          await refetch();

          onClose();
        },
        onError: () => {
          console.error("Failed to create follow-up");
          setErrors({
            remark: "Failed to create follow-up. Please try again.",
          });
        },
      }
    );
  };

  return (
    <ModalCard title={title} oncloseModal={onClose}>
      <div className="flex flex-col gap-6 p-1">
        
        {/* Alert Container */}
        {alert.show && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Alert
              variant={alert.variant as any}
              title={alert.title}
              message={alert.message}
              showLink={false}  
            />
          </div>
        )}

        {/* Input: Remark */}
        <div className="flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Remark <span className="text-red-500">*</span>
          </label>
          <TextArea
            ref={firstInputRef}
            tabIndex={1}
            value={remark}
            rows={6}
            placeholder="e.g., Interview Follow-Up Schedule..."
            className={`w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 ${
              errors.remark
                ? "border-red-300 ring-1 ring-red-100 dark:border-red-500/50"
                : "border-gray-200 dark:border-gray-700"
            }`}
            onChange={(value) => setRemark(value)}
          />
          {errors.remark && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{errors.remark}</p>
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
          <Button 
            size="sm" 
            variant="outline" 
            tabIndex={2} 
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"  
            tabIndex={3}
            onClick={handleSubmit}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:text-gray-900 dark:hover:bg-gray-800"
          >
            Save Follow-Up
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}