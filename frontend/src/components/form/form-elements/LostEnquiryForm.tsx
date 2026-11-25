import React, { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateLostEnquiry } from "@/hooks/useCompleteFollowUp";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
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

export default function LostEnquiryModal({
  onClose,
  title,
  enquiryId,
}: CreateFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  const { refetch } = useFollowUp(enquiryId);
  const { mutateAsync: createLostEnquiry } = useCreateLostEnquiry(); // Destructure the function

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

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  console.log("Creating follow-up for Enquiry ID:", enquiryId);

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

      await createLostEnquiry({ enquiryId, remark });

      // Reset form and close modal
      setRemark("");

      // Refetch Follow-up Data
      await refetch();

      setErrors({});
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not save. Please try again.");
      setErrors({ remark: message });
      setAlert({ show: true, title: "Error", message, variant: "error" });
      setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), 6000);
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
        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"  
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
            onClick={handleSubmit}
          >
            Save Follow-Up
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
