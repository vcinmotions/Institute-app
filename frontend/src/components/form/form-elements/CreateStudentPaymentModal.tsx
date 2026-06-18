"use client";

import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateStudentPayment } from "@/hooks/useCreateStudentPayment";
import { useScrollToError } from "@/app/utils/ScrollToError";

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
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [errors, setErrors] = useState<Partial<PaymentData>>({});

  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });

  const { scrollToError } = useScrollToError();
  const { mutate: createStudentPayment } = useCreateStudentPayment();

  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleDateChange = (value: string) => {
    let digits = value.replace(/\D/g, "");

    if (digits.length > 8) digits = digits.slice(0, 8);

    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
    }

    setPaymentDate(formattedValue);

    let error = "";
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);
      const isValidDate = !isNaN(new Date(`${year}-${month}-${day}`).getTime());
      if (!isValidDate || day > 31 || month > 12) {
        error = "Invalid date format.";
      }
    }

    setErrors((prev) => ({ ...prev, paymentDate: error }));
  };

  const validate = () => {
    const newErrors: Partial<PaymentData> = {};

    if (!amountPaid.trim()) newErrors.amountPaid = "Amount is required.";
    if (!paymentDate.trim()) newErrors.paymentDate = "Date is required.";
    if (!paymentMode.trim()) newErrors.paymentMode = "Mode is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 3000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required inputs.",
        variant: "error",
      });
      scrollToError(validationErrors);
      setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), 3000);
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
      setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), 3000);
      return;
    }

    const id = payment?.id;

    createStudentPayment(
      {
        amountPaid: parseFloat(amountPaid),
        paymentDate: paymentDate,
        paymentMode,
        id,
      },
      {
        onSuccess: () => {
          setAmountPaid("");
          setPaymentDate("");
          setPaymentMode("");
          setErrors({});

          setAlert({
            show: true,
            title: "Payment Processed",
            message: "Student collection transaction successfully stored.",
            variant: "success",
          });

          setTimeout(() => {
            onCloseModal();
          }, 2000);
        },
        onError: (error) => {
          console.error("Payment creation failed:", error);
          setErrors({ amountPaid: "Failed to create payment. Please try again." });
        },
      }
    );
  };

  const paymentModeOptions = [
    { value: "CASH", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHEQUE", label: "Cheque" },
  ];

  return (
    <ModalCard
      title={title}
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">

        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Log processing specifics for tuition fee collections below.
          </p>
        </div>

        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Transaction Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Transaction Details
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Amount Paid Field */}
            <div>
              <Label>Amount Paid *</Label>
              <Input
                ref={firstInputRef}
                tabIndex={1}
                type="number"
                placeholder="Enter amount"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value);
                  setErrors((prev) => ({ ...prev, amountPaid: "" }));
                }}
              />
              {errors.amountPaid && (
                <p className="mt-1 text-sm text-red-500">{errors.amountPaid}</p>
              )}
            </div>

            {/* Payment Date Field */}
            <div>
              <Label>Payment Date (DD-MM-YYYY) *</Label>
              <Input
                tabIndex={2}
                type="text"
                placeholder="DD-MM-YYYY"
                value={paymentDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>
              )}
            </div>

          </div>
        </div>

        {/* Section 2: Method Parameters */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Payment Method
          </h3>
          <div className="grid grid-cols-1 gap-5">

            {/* Payment Mode Field */}
            <div>
              <Label>Select Mode *</Label>
              <div className="relative">
                <Select
                  tabIndex={3}
                  options={paymentModeOptions}
                  placeholder="Select payment mechanism"
                  onChange={(value) => {
                    setPaymentMode(value);
                    setErrors((prev) => ({ ...prev, paymentMode: "" }));
                  }}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.paymentMode && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentMode}</p>
              )}
            </div>

          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
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
            tabIndex={5}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            onClick={handleSubmit}
          >
            Save Payment
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}