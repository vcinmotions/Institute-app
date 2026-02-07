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
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});
  const { refetch } = useFollowUp(enquiryId);
  const { mutate: createCompleteFollowUp } = useCreateCompleteFollowUp(); // Destructure the function
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
    };;
};

  // const handleSubmit = async () => {
  //   const { isValid, errors: validationErrors } = validate();

  //   if (!isValid) {
  //     setAlert({
  //       show: true,
  //       title: "Validation Error",
  //       message: "Please enter required fileds.",
  //       variant: "error",
  //     });

  //     scrollToError(validationErrors); // ✅ ALWAYS WORKS

  //     setTimeout(() => {
  //         setAlert({ show: false, title: "", message: "", variant: "" });
  //       }, 2000);

  //     return; // ⛔ mutation never runs
  //   }

  //   try {
  //     console.log("get Enquiry Id:", enquiryId);
  //     console.log("Remark:", remark);

  //     if (!enquiryId) return;

  //     await createCompleteFollowUp({ enquiryId, remark, currentPage });

  //     // Reset form and close modal
  //     setRemark("");

  //     // Refetch Follow-up Data
  //     await refetch();

  //     setErrors({});
  //     onClose();
  //   } catch (error) {
  //     console.error("Failed to create follow-up:", error);
  //     setErrors({ remark: "Failed to create follow-up. Please try again." });
  //   }
  // };

  const handleSubmit = () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required fileds.",
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
          <Button size="sm" variant="outline" tabIndex={1} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"  
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
            tabIndex={1}
            onClick={handleSubmit}
          >
            Save Follow-Up
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
