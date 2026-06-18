"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Button from "@/components/ui/button/Button";
import ModalCard from "@/components/common/ModalCard";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCreateLab } from "@/hooks/useCreateLab";
import PhoneInput from "../group-input/PhoneInput";
import { countries } from "@/components/common/CountriesCode";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useCreateOpeningBalance } from "@/hooks/useCreateOpeningBalance";
import { normalizePhone, titleCase } from "@/app/utils/Normalize";

interface OpeningBalanceFormProps {
  onCloseModal: () => void;
}

interface OpeningBalanceData {
  name: string;
  contact: string;
  dueAmount: number;
  admissionDate: string;
}

export default function OpeningBalanceForm({ onCloseModal }: OpeningBalanceFormProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: createOpeningBalance } = useCreateOpeningBalance();
  const { inputRefs, scrollToError } = useScrollToError();
  const [student, setStudent] = useState<OpeningBalanceData>({
    name: "",
    contact: "",
    dueAmount: 0,
    admissionDate: "",
  });

  const [errors, setErrors] = useState<Partial<OpeningBalanceData>>({});
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
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "+" &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    // Extract digits only
    const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);
    const formattedNumber = code + digitsOnly;

    setStudent((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));

    if (phoneNumber.length === 10) {
      setErrors((prev) => ({ ...prev, contact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        contact: "Phone number must be 10 digits",
      }));
    }
  };

  const handleDateChange = (field: keyof OpeningBalanceData, value: string) => {
    // Allow only digits
    let digits = value.replace(/\D/g, "");

    // Restrict to max 8 digits (DDMMYYYY)
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-format as DD/MM/YYYY
    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
    }

    // Update form data
    setStudent((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

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


  // 🔹 Handle input change
  const handleChange = (field: keyof OpeningBalanceData, value: string | number) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // 🔹 Basic validation
  const validate = () => {
    const newErrors: Partial<OpeningBalanceData> = {};
    if (!student.name.trim()) newErrors.name = "Student name is required.";
    if (!student.contact.trim()) newErrors.contact = "Contact is required.";
    if (!student.dueAmount || student.dueAmount <= 0)
      newErrors.dueAmount = "Amount must be greater than 0." as any;
    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
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
      }, 3000);

      return;
    }

    const normalizedStudent = {
      ...student,
      name: titleCase(student.name),
      contact: normalizePhone(student.contact),
    };

    createOpeningBalance(normalizedStudent, {
      onSuccess: () => {
        // Reset form
        setStudent({
          name: "",
          contact: "",
          dueAmount: 0,
          admissionDate: ""
        });

        setAlert({
          show: true,
          title: "Success",
          message: "Opening balance created successfully!",
          variant: "Success",
        });

        setTimeout(() => {
          onCloseModal();
        }, 3000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  return (
    <ModalCard
      title="New Student Opening Balance"
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">

        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the student's details and opening balance information below.
          </p>
        </div>

        {alert.show && (
          <Alert
            variant={alert.variant === "Success" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Opening Balance Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Student Information
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div ref={(el) => { inputRefs.current.name = el; }}>
              <Label>Student Name *</Label>
              <Input
                ref={firstInputRef}
                tabIndex={1}
                type="text"
                placeholder="Enter Student Name"
                value={student.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.contact = el; }}>
              <Label>Contact No. *</Label>
              <div className="relative">
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  tabIndex={2}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Contact"
                  onChange={handlePhoneNumberChange}
                />
              </div>
              {errors.contact && (
                <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
              )}
            </div>

            <div>
              <Label>Due Amount *</Label>
              <Input
                tabIndex={3}
                type="number"
                min={0}
                placeholder="Ex. 1500"
                value={student.dueAmount}
                onChange={(e) => handleChange("dueAmount", Number(e.target.value))}
              />
              {errors.dueAmount && (
                <p className="mt-1 text-sm text-red-500">{errors.dueAmount}</p>
              )}
            </div>

            <div>
              <Label>Admission Date</Label>
              <Input
                type="text"
                tabIndex={4}
                placeholder="DD-MM-YYYY"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                value={student.admissionDate}
                onChange={(e) => handleDateChange("admissionDate", e.target.value)}
              />
              {errors.admissionDate && (
                <p className="mt-1 text-sm text-red-500">{errors.admissionDate}</p>
              )}
            </div>

          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            tabIndex={5}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
            tabIndex={6}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            onClick={handleSubmit}
          >
            Save Balance
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}