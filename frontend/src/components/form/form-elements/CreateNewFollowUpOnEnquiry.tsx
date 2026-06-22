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
  const dispatch = useDispatch();
  const [remark, setRemark] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [errors, setErrors] = useState<Partial<FollowUpData>>({});

  const error = useSelector((state: RootState) => state.enquiry.error);
  const firstInputRef = useRef<HTMLInputElement>(null);

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

  // ✅ Expose native isPending state out of mutation hook directly
  const { mutate: createInitialFollowUp, isPending } = useCreateInitialFollowUp();

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!error) return;
    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null));
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleSubmit = () => {
    const validationErrors: Partial<FollowUpData> = {};

    if (!remark.trim()) validationErrors.remark = "Remark is required.";
    if (!scheduledAt) validationErrors.scheduledAt = "Schedule time is required.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please populate all inputs before submitting.",
        variant: "error",
      });

      setTimeout(() => {
        setErrors({});
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);
      return;
    }

    try {
      const isoScheduledAt = new Date(scheduledAt).toISOString();

      createInitialFollowUp(
        {
          enquiryId,
          remark,
          scheduledAt: isoScheduledAt,
        },
        {
          // ✅ Safe modal exit execution path on true successful pipeline responses
          onSuccess: () => {
            toast.success("Follow-up logs initiated successfully");
            setRemark("");
            setScheduledAt("");
            setErrors({});
            onClose();
          },
          onError: (err: any) => {
            console.error("Mutation save tracking error failure:", err);
          }
        }
      );
    } catch (e) {
      console.error("Failed to parse datetime parameters:", e);
    }
  };

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
            disabled={isPending}
            className="w-full rounded capitalize border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            onChange={(value) => setRemark(value)}
            rows={6}
            placeholder="Interview Follow-Up Schedule Notes..."
          />
          {errors.remark && (
            <p className="text-sm text-red-500 mt-1">{errors.remark}</p>
          )}
        </div>

        <div>
          <label className="block pb-2 text-sm text-gray-700 dark:text-gray-300">
            Schedule At
          </label>
          <div className="relative w-full">
            <input
              tabIndex={2}
              type="datetime-local"
              value={scheduledAt}
              disabled={isPending}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {errors.scheduledAt && (
              <p className="pt-2 text-sm text-red-500">{errors.scheduledAt}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" tabIndex={3} disabled={isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900 disabled:opacity-50"
            tabIndex={4}
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? "Saving Record..." : "Save Follow-Up"}
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}