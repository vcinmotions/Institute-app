"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useRouter } from "next/navigation";
import { useCreateCourse } from "@/hooks/useCreateCourseData";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

type FormErrors = Partial<Record<keyof CourseData, string>>;

interface CourseData {
  description: string;
  durationMonths: string;
  name: string; // ✅ this matches backend
  paymentType: string[];
  totalAmount: string;
}

interface InstallmentDetail {
  installment: string;
  addAmount: string;
}

export default function CourseForm() {
  const router = useRouter();
  const { form, reset, setField } = useCourseStore();
  const [newCourse, setNewCourse] = useState<CourseData>({
    name: "",
    description: "",
    durationMonths: "",
    paymentType: [],
    totalAmount: "",
  });

  // Alert State
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

  const { inputRefs, scrollToError } = useScrollToError();
  const [errors, setErrors] = useState<FormErrors>({});
  const [oneTime, setOneTime] = useState<boolean>(false);
  const [installment, setInstallment] = useState<boolean>(false);
  const { mutate: createCourse } = useCreateCourse();

  // Installments State (Array)
  const [installments, setInstallments] = useState<InstallmentDetail[]>([
    { installment: "2", addAmount: "" },
  ]);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const newTypes: string[] = ["ONE_TIME"];
    setNewCourse((prev) => ({ ...prev, paymentType: newTypes }));
    setOneTime(true);
  }, []);

  // Restore form state when opened
  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewCourse((prev) => ({
      ...prev,
      name: form.name ?? prev.name,
      description: form.description ?? prev.description,
      durationMonths: form.durationMonths ?? prev.durationMonths,
      totalAmount: form.totalAmount ?? prev.totalAmount,
      paymentType: form.paymentType
        ? Array.isArray(form.paymentType) && form.paymentType.length > 0
          ? form.paymentType
          : [form.paymentType] // convert single string to array
        : prev.paymentType,
    }));
  }, [form]);

  const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
    // toggle the UI checkboxes
    if (value === "ONE_TIME") {
      setOneTime((prev) => !prev);
    } else {
      setInstallment((prev) => !prev);
    }

    setNewCourse((prev) => {
      const updated = [];
      const ot = value === "ONE_TIME" ? !oneTime : oneTime;
      const inst = value === "INSTALLMENT" ? !installment : installment;

      if (ot) updated.push("ONE_TIME");
      if (inst) updated.push("INSTALLMENT");

      return { ...prev, paymentType: updated };
    });
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newCourse.name.trim()) newErrors.name = "Course name is required.";
    if (!newCourse.durationMonths.trim()) newErrors.durationMonths = "Duration is required.";
    if (!newCourse.totalAmount.trim()) newErrors.totalAmount = "Course amount is required.";
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

  const updateInstallment = (
    index: number,
    field: keyof InstallmentDetail,
    value: string
  ) => {
    setInstallments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

    const updatedInstallments = [...installments];
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    };
    setNewCourse((prev) => ({
      ...prev,
      installments: updatedInstallments,
    }));
  };

  const addInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      { installment: String(prev.length + 1 + 1), addAmount: "" },
    ]);
  };

  const removeInstallment = (index: number) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field: keyof CourseData, value: string) => {
    // Ensure non-negative
    if (["durationMonths", "totalAmount"].includes(field)) {
      const numericValue = Number(value);
      if (numericValue < 0) return; // ignore negative
    }

    setNewCourse((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "paymentType" && value === "ONE_TIME"
        ? { installmentCount: "" }
        : {}),
    }));

    setField(field, value);

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
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
      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 3000);
      return;
    }

    const normalizedCourse = {
      ...newCourse,
      name: titleCase(newCourse.name),
    };

    createCourse(normalizedCourse, {
      onSuccess: () => {
        setNewCourse({
          description: "",
          durationMonths: "",
          name: "",
          paymentType: [],
          totalAmount: "",
        });

        setAlert({
          show: true,
          title: "Course Created",
          message: "Course has been successfully created.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          router.back();
        }, 1000);
      },
      onError: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Course" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">Course Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to log a new system Course.</p>
          </div>

          {/* Alert Messages */}
          {alert.show && (
            <Alert
              variant={alert.title === "Course Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* Form Grouping: Course Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Course Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.name = el;
                }}
              >
                <Label>Course Name *</Label>
                <Input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Ex. Full Stack Developer"
                  value={titleCase(newCourse.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.durationMonths = el;
                }}
              >
                <Label>Duration (Months) *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter Duration"
                  value={newCourse.durationMonths}
                  onChange={(e) => handleChange("durationMonths", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.durationMonths && (
                  <p className="mt-1 text-sm text-red-500">{errors.durationMonths}</p>
                )}
              </div>

              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.totalAmount = el;
                }}
              >
                <Label>Total Course Amount *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter Amount"
                  value={newCourse.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.totalAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Grouping: Payment Configuration */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Payment Configuration
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.paymentType = el;
                }}
              >
                <Label>Accepted Payment Types *</Label>
                <div className="mt-2 flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      className="h-5 w-5"
                      checked={oneTime}
                      onChange={() => handleTypesCheck("ONE_TIME")}
                    />
                    <Label className="mb-0">ONE TIME</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      className="h-5 w-5"
                      checked={installment}
                      onChange={() => handleTypesCheck("INSTALLMENT")}
                    />
                    <Label className="mb-0">INSTALLMENTS</Label>
                  </div>
                </div>
                {errors.paymentType && (
                  <p className="mt-2 text-sm text-red-500">{errors.paymentType}</p>
                )}
              </div>

              {/* Conditional Breakdowns */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {oneTime && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <Label className="text-gray-700 dark:text-gray-300">One Time Payment Detail</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Input
                        type="text"
                        className="w-1/3 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900"
                        value="ONE_TIME"
                        disabled
                      />
                      <Input
                        type="number"
                        min={0}
                        className="w-2/3 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900"
                        value={newCourse.totalAmount}
                        placeholder="Amount"
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {installment && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <Label className="text-gray-700 dark:text-gray-300">Installments Configuration</Label>

                    <div className="mt-2 space-y-3">
                      {installments.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            type="text"
                            className="w-24 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 text-center cursor-not-allowed dark:border-gray-700 dark:bg-gray-900"
                            value={item.installment}
                            disabled
                          />
                          <Input
                            type="number"
                            min={0}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            value={item.addAmount}
                            placeholder="Amount"
                            onChange={(e) =>
                              updateInstallment(index, "addAmount", e.target.value)
                            }
                          />
                          {index !== 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeInstallment(index)}
                              className="px-3 py-2"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addInstallment}
                      className="mt-4 w-full border-dashed"
                    >
                      + Add Installment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px] rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSubmit}
              className="min-w-[120px] rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save Course
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}