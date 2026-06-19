"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useEditCourse } from "@/hooks/useEditCourse";
import Checkbox from "../input/Checkbox";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

type FormErrors = Partial<Record<keyof CourseData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  batchData: CourseData;
}

interface CourseData {
  id: string;
  description: string;
  durationMonths: string;
  name: string;
  paymentType: any;
  totalAmount: string;
  installments?: InstallmentDetail[];
  courseFeeStructure?: {
    paymentType: any[];
    totalAmount: string;
    installments?: {
      number: number;
      amount: number;
    }[];
  };
}

interface InstallmentDetail {
  installment: string;
  addAmount: string;
}

export default function EditCourseForm({
  onCloseModal,
  batchData,
}: DefaultInputsProps) {
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: "",
    name: "",
    description: "",
    durationMonths: "",
    paymentType: "",
    totalAmount: "",
    installments: [],
  });

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

  const modalBodyRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { inputRefs, scrollToError } = useScrollToError();
  const [errors, setErrors] = useState<FormErrors>({});

  const [installments, setInstallments] = useState<InstallmentDetail[]>([
    { installment: "2", addAmount: "" },
  ]);
  const [oneTime, setOneTime] = useState<boolean>(false);
  const [installment, setInstallment] = useState<boolean>(false);

  const { mutate: editCourse } = useEditCourse();

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!batchData) return;

    const pt = Array.isArray(batchData?.courseFeeStructure?.paymentType)
      ? batchData.courseFeeStructure.paymentType
      : [];

    const mappedInstallments =
      batchData?.courseFeeStructure?.installments?.map((ins) => ({
        installment: String(ins.number),
        addAmount: String(ins.amount),
      })) || [];

    setNewCourse({
      id: String(batchData.id || ""),
      name: batchData.name || "",
      description: batchData.description || "",
      durationMonths: String(batchData.durationMonths || ""),
      totalAmount: String(batchData?.courseFeeStructure?.totalAmount || ""),
      paymentType: pt,
      installments: mappedInstallments,
    });

    setOneTime(pt.includes("ONE_TIME"));
    setInstallment(pt.includes("INSTALLMENT"));

    setInstallments(
      mappedInstallments.length > 0
        ? mappedInstallments
        : [{ installment: "1", addAmount: "" }],
    );
  }, [batchData]);

  const scrollModalToTop = () => {
    modalBodyRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newCourse.name.trim()) {
      newErrors.name = "Course name is required.";
    }

    if (!newCourse.durationMonths.trim()) {
      newErrors.durationMonths = "Duration is required.";
    }

    if (!newCourse.totalAmount.trim()) {
      newErrors.totalAmount = "Total course amount is required.";
    }

    if (!newCourse.paymentType || newCourse.paymentType.length === 0) {
      newErrors.paymentType = "Please select at least one payment type.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
    if (value === "ONE_TIME") {
      const newOneTime = !oneTime;
      setOneTime(newOneTime);

      setNewCourse((prev) => {
        let updatedTypes = [];
        if (newOneTime) updatedTypes.push("ONE_TIME");
        if (installment) updatedTypes.push("INSTALLMENT");
        return { ...prev, paymentType: updatedTypes };
      });
      return;
    }

    const newInstallment = !installment;
    setInstallment(newInstallment);

    if (!newInstallment) {
      setInstallments([]);
      setNewCourse((prev) => ({
        ...prev,
        installments: [],
        paymentType: oneTime ? ["ONE_TIME"] : [],
      }));
      return;
    }

    setInstallments((prev) =>
      prev.length ? prev : [{ installment: "2", addAmount: "" }],
    );

    setNewCourse((prev) => {
      let updatedTypes = [];
      if (oneTime) updatedTypes.push("ONE_TIME");
      updatedTypes.push("INSTALLMENT");
      return { ...prev, paymentType: updatedTypes };
    });
  };

  const updateInstallment = (index: number, field: keyof InstallmentDetail, value: string) => {
    setInstallments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );

    const updatedInstallments = [...installments];
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    };

    setNewCourse((prev) => ({
      ...prev,
      installments: updatedInstallments.map((i, idx) =>
        idx === index ? { ...i, [field]: value } : i,
      ),
    }));
  };

  const addInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      { installment: String(prev.length + 1), addAmount: "" },
    ]);
  };

  const removeInstallment = (index: number) => {
    const filtered = installments.filter((_, i) => i !== index);

    if (filtered.length === 0) {
      setInstallments([{ installment: "1", addAmount: "" }]);
      setNewCourse((prev) => ({
        ...prev,
        paymentType: "",
        installments: [],
        totalAmount: "",
      }));
      setOneTime(false);
      setInstallment(false);
      return;
    }

    setInstallments(filtered);
    setNewCourse((prev) => ({ ...prev, installments: filtered }));
  };

  const handleChange = (field: keyof CourseData, value: string) => {
    setNewCourse((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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
      scrollModalToTop();
      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);
      return;
    }

    const id = batchData.id;
    const normalizedCourse = {
      ...newCourse,
      name: titleCase(newCourse.name),
    };

    editCourse(
      { newCourse: normalizedCourse, id },
      {
        onSuccess: () => {
          setNewCourse({
            id: "",
            description: "",
            durationMonths: "",
            name: "",
            paymentType: "",
            totalAmount: "",
          });

          setAlert({
            show: true,
            title: "Course Updated",
            message: "Course details have been successfully saved.",
            variant: "success",
          });

          scrollModalToTop();
          setTimeout(() => {
            onCloseModal();
          }, 1000);
        },
        onError: () => {
          scrollModalToTop();
        },
      },
    );
  };

  return (
    <ModalCard
      title="Edit Course"
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">

        {/* Header Description */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the details below to modify the system course configuration.
          </p>
        </div>

        {/* Global Alerts */}
        {alert.show && (
          <Alert
            variant={alert.title === "Course Updated" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Course Info */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Course Configuration
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div ref={(el) => { inputRefs.current.name = el; }}>
              <Label>Course Name *</Label>
              <Input
                ref={firstInputRef}
                tabIndex={1}
                type="text"
                placeholder="Ex. Full Stack Developer"
                value={titleCase(newCourse.name)}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.durationMonths = el; }}>
              <Label>Duration (Weeks) *</Label>
              <Input
                type="number"
                tabIndex={2}
                min={0}
                placeholder="12"
                value={newCourse.durationMonths}
                onChange={(e) => handleChange("durationMonths", e.target.value)}
              />
              {errors.durationMonths && <p className="mt-1 text-sm text-red-500">{errors.durationMonths}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.totalAmount = el; }}>
              <Label>Total Course Fee *</Label>
              <Input
                type="number"
                min={0}
                tabIndex={3}
                placeholder="12000"
                value={newCourse.totalAmount}
                onChange={(e) => handleChange("totalAmount", e.target.value)}
              />
              {errors.totalAmount && <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Fee Ledger Configurations */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Payment & Fee Ledger Setup
          </h3>

          <div className="space-y-5">
            <div ref={(el) => { inputRefs.current.paymentType = el; }}>
              <Label>Allowed Payment Strategies *</Label>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    className="h-5 w-5"
                    checked={oneTime}
                    onChange={() => handleTypesCheck("ONE_TIME")}
                  />
                  <Label className="mb-0 cursor-pointer">One Time Processing</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    className="h-5 w-5"
                    checked={installment}
                    onChange={() => handleTypesCheck("INSTALLMENT")}
                  />
                  <Label className="mb-0 cursor-pointer">Installment Matrix</Label>
                </div>
              </div>
              {errors.paymentType && <p className="mt-2 text-sm text-red-500">{errors.paymentType}</p>}
            </div>

            {/* One Time Calculations Block */}
            {oneTime && (
              <div className="border-t pt-4 dark:border-gray-800">
                <Label>Lump Sum Parameter Breakdown</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input type="text" className="w-32 bg-gray-100/60 dark:bg-gray-800" value="ONE_TIME" disabled />
                  <Input type="number" className="w-48 bg-gray-100/30" value={newCourse.totalAmount} placeholder="Amount" readOnly />
                </div>
              </div>
            )}

            {/* Dynamic Installments Array Section */}
            {installment && (
              <div className="border-t pt-4 dark:border-gray-800 space-y-3">
                <Label>Installments Threshold Breakdown</Label>

                {installments.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input type="text" className="w-32 bg-gray-100/60 dark:bg-gray-800 text-center" value={`Term ${item.installment}`} disabled />
                    <Input
                      type="number"
                      min={0}
                      className="w-48"
                      value={item.addAmount}
                      placeholder="Amount Allocation"
                      onChange={(e) => updateInstallment(index, "addAmount", e.target.value)}
                    />
                    {index !== 0 && (
                      <Button size="sm" variant="outline" className="h-9 w-9 px-0 min-w-0" onClick={() => removeInstallment(index)}>
                        ✕
                      </Button>
                    )}
                  </div>
                ))}

                <Button size="sm" variant="outline" className="mt-2" onClick={addInstallment}>
                  + Add Installment Line
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Form Action Buttons Footer Wrapper */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            tabIndex={4}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
            tabIndex={5}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            onClick={handleSubmit}
          >
            Save Course
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}