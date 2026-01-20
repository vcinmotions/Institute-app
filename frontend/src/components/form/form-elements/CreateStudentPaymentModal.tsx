import React, { useEffect, useRef, useState } from "react";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateStudentPayment } from "@/hooks/useCreateStudentPayment";
import { useFetchPayment } from "@/hooks/queries/useQueryFetchPayment";
import { useDispatch } from "react-redux";
import { setPayment } from "@/store/slices/paymentSlice";
import { getPayment } from "@/lib/api";
import { Alert } from "@heroui/react";

// interface CreateStudentPaymentModalProps {
//   onCloseModal: () => void;
//   payment: any;
//   title: string;
// }

interface CreateStudentPaymentModalProps {
  onCloseModal: () => void;
  payment: any;
  title: string;
  currentPage: number;
  searchQuery: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface PaymentData {
  amountPaid: string;
  paymentDate: string;
  paymentMode: string;
}

export default function CreateStudentPaymentModal({
  onCloseModal,
  payment,
  title,
}: CreateStudentPaymentModalProps) {
  const dispatch = useDispatch();
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [errors, setErrors] = useState<Partial<PaymentData>>({});

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

  const { mutate: createStudentPayment } = useCreateStudentPayment();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  console.log("PAYMENT DATA IN PAYEMT FORM", payment);

  const handleDateChange = (field: keyof PaymentData, value: string) => {
    // Allow only digits
    let digits = value.replace(/\D/g, "");

    // Restrict to max 8 digits (DDMMYYYY)
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-format as DD/MM/YYYY
    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }

    // Update form data
    setPaymentDate(formattedValue);

    // Simple validation (optional)
    let error = "";
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);
      const isValidDate = !isNaN(new Date(`${year}-${month}-${day}`).getTime());
      if (!isValidDate || day > 31 || month > 12) {
        error = "Invalid date";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const validate = () => {
    const newErrors: Partial<PaymentData> = {};

    if (!amountPaid.trim()) newErrors.amountPaid = "Amount is required.";
    if (!paymentDate.trim()) newErrors.paymentDate = "Date is required.";
    if (!paymentMode.trim()) newErrors.paymentMode = "Mode is required.";

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 2000);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {

    

    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
        variant: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 3000);

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

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return;
    }

    const [day, month, year] = paymentDate.split("/").map(Number);
    const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
    if (isNaN(parsedDate.getTime())) {
      setErrors({ paymentDate: "Invalid date" });
      return;
    }

    const id = payment?.id;
    console.log("GET PAYMENT STUDENTFEE ID:", id);

    try {
      await createStudentPayment({
        amountPaid: parseFloat(amountPaid),
        paymentDate: new Date(parsedDate).toISOString(),
        paymentMode,
        id,
      });

      // Reset form and close modal
      setAmountPaid("");
      setPaymentDate("");
      setPaymentMode("");
      setErrors({});
      onCloseModal();

      setAlert({
        show: true,
        title: "Enquiry Updated",
        message: "Enquiry has been Successfully Updated.",
        variant: "success",
      });

      // ✅ Close modal after 3s
      setTimeout(() => {
        onCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Payment creation failed:", error);
      setErrors({ amountPaid: "Failed to create payment. Please try again." });
    }
  };

  return (
    <ModalCard title="Student Payment" oncloseModal={onCloseModal}>
      <div className="space-y-4">
        {/* Amount Paid */}
        <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Amount Paid
        </label>
        <input
          ref={firstInputRef}
          tabIndex={1}
          type="number"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={amountPaid}
          placeholder="Enter amount"
          onChange={(e) => setAmountPaid(e.target.value)}
        />
        {errors.amountPaid && (
          <p className="text-sm text-red-500">{errors.amountPaid}</p>
        )}
        </div>

        <div>
        {/* Payment Date */}
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Payment Date
        </label>
        <input
          tabIndex={2}
          type="Text"
          placeholder="10/10/2025"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
          value={paymentDate}
          onChange={(e) => handleDateChange("paymentDate", e.target.value)}
        />
        {errors.paymentDate && (
          <p className="text-sm text-red-500">{errors.paymentDate}</p>
        )}
        </div>

        <div>
        {/* Payment Mode */}
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Payment Mode
        </label>
        <select
          tabIndex={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option value="">Select Mode</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CHEQUE">Cheque</option>
        </select>
        {errors.paymentMode && (
          <p className="text-sm text-red-500">{errors.paymentMode}</p>
        )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            tabIndex={4}
            onClick={onCloseModal}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"  
            className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
            tabIndex={5}
            onClick={handleSubmit}
          >
            Save Payment
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
