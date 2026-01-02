import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateNextFollowUp } from "@/hooks/useCreateNextFollowUp";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFollowUp } from "@/hooks/useQueryFetchFollow";
import TextArea from "../input/TextArea";
import Alert from "@/components/ui/alert/Alert";

interface CreateFollowUpModalProps {
  onClose: () => void;
  onSuccess: () => void;
  followUpId: string;
  enquiryId: string | null; // optional usage
  title: string;
}

interface FollowUpData {
  remark: string;
  scheduledAt: string;
}

export default function CreateFollowUpModal({
  onClose,
  followUpId,
  enquiryId,
  title,
  onSuccess
}: CreateFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  const { refetch } = useFollowUp(enquiryId);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  // New state for alert
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
    const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);

  const { mutate: createnextFollowUp } = useCreateNextFollowUp();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const validationErrors: Partial<FollowUpData> = {};

    if (!remark.trim()) validationErrors.remark = "Remark is required.";
    if (!scheduledAt)
      validationErrors.scheduledAt = "Schedule time is required.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
 setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
        variant: "error",
      });
      // Optional: clear validation errors after 3 seconds
       // ✅ FIXED setTimeout
    setTimeout(() => {
      setErrors({});
      setAlert({ show: false, title: "", message: "", variant: "" });
    }, 2000); 
      return;
    }

    try {
      const isoScheduledAt = new Date(scheduledAt).toISOString();

      console.log("Creating follow-up for Follow Up ID:", followUpId);
      console.log("get Enquiry Id:", enquiryId);
      console.log("Remark:", remark);
      console.log("Scheduled At (ISO):", isoScheduledAt);

      await createnextFollowUp({
        enquiryId,
        followUpId,
        remark,
        scheduledAt: isoScheduledAt,
        currentPage,
      });

         // ✅ Trigger parent refetch
         onSuccess(); 

      // Reset form and close modal
      setRemark("");
      setScheduledAt("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create follow-up:", error);
      setErrors({ remark: "Failed to create follow-up. Please try again." });
    }
  };

  return (
    <ModalCard title={title} oncloseModal={onClose}>
      <div className="space-y-4">
      {alert.show && (
          <Alert
            variant={"error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}
        <div>
          <label className="block pb-2 text-sm text-gray-700 dark:text-gray-300">
            Remark
          </label>
          {/* <textarea
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm dark:bg-gray-900 text-black dark:text-white placeholder:text-gray-500"
          value={remark}
          placeholder="Interview Follow-Up Schedule"
          onChange={(e) => setRemark(e.target.value)}
        /> */}

          <TextArea
            ref={firstInputRef}
            tabIndex={1}
            value={remark}
            className="w-full rounded border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            onChange={(value) => setRemark(value)}
            rows={6}
            placeholder="Interview Follow-Up Schedule"
          />
          {errors.remark && (
            <p className="text-sm text-red-500">{errors.remark}</p>
          )}
        </div>

        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Schedule At
        </label>
        <div className="relative w-full">
          <div>
            <input
              tabIndex={2}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400"
            />
            {errors.remark && (
              <p className="text-sm text-red-500">{errors.remark}</p>
            )}

            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" tabIndex={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            tabIndex={4}
            onClick={handleSubmit}
          >
            Save Follow-Up
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
