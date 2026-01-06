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

  const validate = () => {
  const validationErrors: Partial<FollowUpData> = {};
  if (!remark.trim()) validationErrors.remark = "Remark is required.";
  if (!scheduledAt) validationErrors.scheduledAt = "Schedule time is required.";

  setErrors(validationErrors);
  return Object.keys(validationErrors).length === 0;
};

//   const handleSubmit = async () => {
//     const validationErrors: Partial<FollowUpData> = {};

//     if (!remark.trim()) validationErrors.remark = "Remark is required.";
//     if (!scheduledAt)
//       validationErrors.scheduledAt = "Schedule time is required.";

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//  setAlert({
//         show: true,
//         title: "Validation Error",
//         message: "Please enter all inputs.",
//         variant: "error",
//       });
//       // Optional: clear validation errors after 3 seconds
//        // ✅ FIXED setTimeout
//     setTimeout(() => {
//       setErrors({});
//       setAlert({ show: false, title: "", message: "", variant: "" });
//     }, 2000); 
//       return;
//     }

//     try {
//       const isoScheduledAt = new Date(scheduledAt).toISOString();

//       console.log("Creating follow-up for Follow Up ID:", followUpId);
//       console.log("get Enquiry Id:", enquiryId);
//       console.log("Remark:", remark);
//       console.log("Scheduled At (ISO):", isoScheduledAt);

//       await createnextFollowUp({
//         enquiryId,
//         followUpId,
//         remark,
//         scheduledAt: isoScheduledAt,
//         currentPage,
//       });

//          // ✅ Trigger parent refetch
//          onSuccess(); 

//       // Reset form and close modal
//       setRemark("");
//       setScheduledAt("");
//       setErrors({});
//       onClose();
//     } catch (error) {
//       console.error("Failed to create follow-up:", error);
//       setErrors({ remark: "Failed to create follow-up. Please try again." });
//     }
//   };

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

  createnextFollowUp(
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
          3000,
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
