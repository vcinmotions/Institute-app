import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateNextFollowUp, useEditNextFollowUp } from "@/hooks/useCreateNextFollowUp";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import TextArea from "../input/TextArea";
import Alert from "@/components/ui/alert/Alert";

interface EditFollowUpModalProps {
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

export default function EditFollowUpModal({
  onClose,
  followUpId,
  enquiryId,
  title,
  onSuccess
}: EditFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  const { followupDetails , refetch } = useFollowUp(enquiryId);
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

  const { mutate: editFollowUp } = useEditNextFollowUp();

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Prefill existing data when modal opens
  useEffect(() => {
    const followUp = followupDetails?.followup?.find(f => f.id === followUpId);
    if (followUp) {
      setRemark(followUp.remark || "");
      setScheduledAt(new Date(followUp.scheduledAt).toISOString().slice(0, 16));
    }
    firstInputRef.current?.focus();
  }, [followUpId, followupDetails]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const validate = () => {
  const validationErrors: Partial<FollowUpData> = {};
  if (!remark.trim()) validationErrors.remark = "Remark is required.";
  if (!scheduledAt) validationErrors.scheduledAt = "Schedule time is required.";

  setErrors(validationErrors);
  return Object.keys(validationErrors).length === 0;
};

console.log("folow-up id in edit folow-up modal:", followUpId);
console.log("enquiry id in edit folow-up modal:", enquiryId);

const handleSubmit = async () => {
  if (!validate()) {
    setAlert({
      show: true,
      title: "Validation Error",
      message: "Please fill all fields.",
      variant: "error",
    });

    setTimeout(
      () => setAlert({ show: false, title: "", message: "", variant: "" }),
      3000,
    );
    return;
  }

  const isoScheduledAt = new Date(scheduledAt).toISOString();

  editFollowUp(
    {
      enquiryId,
      followUpId,
      remark,
      scheduledAt: isoScheduledAt,
      currentPage,
    },
    {
      onSuccess: () => {
        // Reset form
        setRemark("");
        setScheduledAt("");
        setErrors({});

        // Show success alert
        setAlert({
          show: true,
          title: "Follow-Up Created",
          message: "New follow-up has been successfully created.",
          variant: "success",
        });

        // Call parent refetch / close modal after a short delay
        setTimeout(() => {
          onSuccess(); // triggers Timeline refetch
          onClose();   // closes modal
          setAlert({ show: false, title: "", message: "", variant: "" });
        }, 1000);
      },

      onError: (error: any) => {
        console.error("Failed to create follow-up:", error);
        setErrors({ remark: "Failed to create follow-up. Please try again." });
        // Optional: show error alert
        setAlert({
          show: true,
          title: "Error",
          message: "Failed to create follow-up. Please try again.",
          variant: "error",
        });

        setTimeout(
          () => setAlert({ show: false, title: "", message: "", variant: "" }),
          2000,
        );
      },
    },
  );
};

  return (
    <ModalCard title={title} oncloseModal={onClose}>
      <div className="space-y-4">
      {alert.show && (
          <Alert
            variant={alert.variant as any}
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
            className="w-full capitalize rounded border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
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
