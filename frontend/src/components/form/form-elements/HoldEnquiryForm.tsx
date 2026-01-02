import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateHoldEnquiry } from "@/hooks/useCompleteFollowUp";
import { useFollowUp } from "@/hooks/useQueryFetchFollow";
import TextArea from "../input/TextArea";
import Alert from "@/components/ui/alert/Alert";

interface CreateFollowUpModalProps {
  onClose: () => void;
  title: string;
  enquiryId: string | null; // optional usage
}

interface FollowUpData {
  remark: string;
  scheduledAt: string;
}

export default function HoldEnquiryModal({
  onClose,
  title,
  enquiryId,
}: CreateFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  const { refetch } = useFollowUp(enquiryId);
  const { mutate: createHoldEnquiry } = useCreateHoldEnquiry(); // Destructure the function
  
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

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const validationErrors: Partial<FollowUpData> = {};

    if (!remark.trim()) validationErrors.remark = "Remark is required.";

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

    try {
      console.log("get Enquiry Id:", enquiryId);
      console.log("Remark:", remark);

      await createHoldEnquiry({ enquiryId, remark });

      // Reset form and close modal
      setRemark("");

      // Refetch Follow-up Data
      await refetch();

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
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}  
          />
        )}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Remark
          </label>
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
        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" tabIndex={2} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            tabIndex={3}
            onClick={handleSubmit}
          >
            Save Follow-Up
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
