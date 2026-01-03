import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateInitialFollowUp } from "@/hooks/useCreateInitialFollowUp";
import { setError } from "@/store/slices/enquirySlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/store";
import TextArea from "../input/TextArea";
import Alert from "@/components/ui/alert/Alert";
import DatePicker from "../date-picker";

interface CreateFollowUpModalProps {
  onClose: () => void;
  enquiryId: string;
  title: string;
}

interface FollowUpData {
  remark: string;
  scheduledAt: string;
}

export default function CreateNewFollowUpOnEnquiryModal({
  onClose,
  enquiryId,
  title,
}: CreateFollowUpModalProps) {
  const [remark, setRemark] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);

  const dispatch = useDispatch();
  
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

  // Option 2: callback style
  const { mutate: createInitialFollowUp } = useCreateInitialFollowUp();
  console.log("Creating follow-up for Enquiry ID:", enquiryId);
  console.log("CURRENTTTT PAGE IN CREATE NEW FOLLOW_UP:", currentPage);

  const error = useSelector((state: RootState) => state.enquiry.error);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

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

      console.log("Creating follow-up for Enquiry ID:", enquiryId);
      console.log("Remark:", remark);
      console.log("Scheduled At (ISO):", isoScheduledAt);

      await createInitialFollowUp({
        enquiryId,
        remark,
        currentPage,
        scheduledAt: isoScheduledAt,
      });

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

  console.log("Creating follow-up for Enquiry ID:", enquiryId);

  return (
    <ModalCard title={title} oncloseModal={onClose}>
      <div className="space-y-6">
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

        <div>
          <label className="block pb-2 text-sm text-gray-700 dark:text-gray-300">
            Schedule At
          </label>
          <div className="relative w-full">
            {/* <input
              tabIndex={2}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
            /> */}
            <DatePicker 
             mode="single"
             id={"date"} 
             tabIndex={2}
            
              defaultDate={scheduledAt}
              onChange={(_, dateStr) => {
                setScheduledAt(dateStr);
              }}
            />
            {errors.scheduledAt && (
              <p className="pt-2 text-sm text-red-500">{errors.scheduledAt}</p>
            )}
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

