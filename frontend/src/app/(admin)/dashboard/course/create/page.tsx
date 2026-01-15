"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useRouter } from "next/navigation";

import { useCreateCourse } from "@/hooks/useCreateCourseData";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";

interface CourseData {
  description: string;
  durationWeeks: string;
  name: string; // ✅ this matches backend
  paymentType: any;
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
    durationWeeks: "",
    paymentType: "",
    totalAmount: "",
  });

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

  const [errors, setErrors] = useState<Partial<CourseData>>({});
  const [oneTime, setOneTime] = useState<boolean>(false);
  const [installment, setInstallment] = useState<boolean>(false);
  const { mutate: createCourse } = useCreateCourse();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  // Installments State (Array)
  const [installments, setInstallments] = useState<InstallmentDetail[]>([
    { installment: "2", addAmount: "" },
  ]);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const newTypes: string[] = [];
    newTypes.push("ONE_TIME");

    setNewCourse((prev) => ({ ...prev, paymentType: newTypes }));
    console.log("Push By Default ONE_TIME FROM USEEFFECT()", newTypes);
    setOneTime(true);
  }, []);

  // 🟢 Restore data from Zustand when page opens
  // 🟢 Restore saved form when opening Course Create

  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewCourse((prev) => ({
      name: form.name || prev.name,
      description: form.description || prev.description,
      durationWeeks: form.durationWeeks || prev.durationWeeks,
      paymentType: form.paymentType?.length
        ? form.paymentType
        : prev.paymentType,
      totalAmount: form.totalAmount || prev.totalAmount,
    }));
  }, [form]);

  // useEffect(() => {
  //   if (!form || Object.keys(form).length === 0) return;

  //   setNewCourse({
  //     name: form.name || "",
  //     description: form.description || "",
  //     durationWeeks: form.durationWeeks || "",
  //     paymentType: form.paymentType || "",
  //     totalAmount: form.totalAmount || "",
  //   });
  // }, [form]);

  const paymentType = [
    { value: "ONE_TIME", label: "One Time" },
    { value: "INSTALLMENT", label: "Installment" },
  ];

  // const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
  //   if (value === "ONE_TIME") {
  //     setOneTime(!oneTime);
  //   } else if (value === "INSTALLMENT") {
  //     const newInstallmentState = !installment;
  //     setInstallment(newInstallmentState);
  //     setNewCourse((prev) => ({
  //       ...prev,
  //       paymentType: newInstallmentState ? "INSTALLMENT" : "", // clear if unchecked
  //     }));
  //   }
  // };

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

  // const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
  //   if (value === "ONE_TIME") {
  //     setOneTime(!oneTime);
  //   } else if (value === "INSTALLMENT") {
  //     setInstallment(!installment);
  //   }

  //   const newTypes: string[] = [];
  //   if (oneTime || value === "ONE_TIME") newTypes.push("ONE_TIME");
  //   if (installment || value === "INSTALLMENT") newTypes.push("INSTALLMENT");

  //   setNewCourse((prev) => ({ ...prev, paymentType: newTypes }));
  // };

  const validate = () => {
    const newErrors: Partial<CourseData> = {};

    if (!newCourse.durationWeeks.trim()) {
      newErrors.durationWeeks = "Name is required.";
    }

    if (!newCourse.name.trim()) {
      newErrors.name = "Course is required.";
    }

    if (!newCourse.totalAmount.trim()) {
      newErrors.totalAmount = "totalAmount is required.";
    }

    // if (!newCourse.paymentType) {
    //   newErrors.paymentType = "paymentType is required.";
    // }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const updateInstallment = (
    index: number,
    field: keyof InstallmentDetail,
    value: string,
  ) => {
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
      installments: updatedInstallments,
    }));
  };

  // Add new installment
  const addInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      { installment: String(prev.length + 1 + 1), addAmount: "" },
    ]);
  };

  // Remove installment
  const removeInstallment = (index: number) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field: keyof CourseData, value: string) => {
    setNewCourse((prev) => ({
      ...prev,
      [field]: value.toLocaleLowerCase(),
      ...(field === "paymentType" && value === "ONE_TIME"
        ? { installmentCount: "" }
        : {}),
    }));

    setField(field, value); // <-- IMPORTANT

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleResetForm = () => {
    reset();

    setNewCourse({
      description: "",
      durationWeeks: "",
      name: "",
      paymentType: "",
      totalAmount: "",
    });
  };

  const handleSubmit = async () => {
    console.log("Submitting enquiry data:", newCourse);

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

    // const formData = new FormData();

    // // ✅ Append all fields to FormData
    // Object.entries(installments).forEach(([key, value]) => {
    //   if (value !== undefined && value !== null) {
    //     formData.append(key, value.toString());
    //   }
    // });

    createCourse(newCourse, {
      onSuccess: () => {
        setNewCourse({
          description: "",
          durationWeeks: "",
          name: "",
          paymentType: "",
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
          // redirect("/dashboard/course");
          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET COURSE DATA IN STORE:", form);
  console.log("GET NEW COURSE DATA IN STORE:", newCourse);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Course" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6">Course Infomation</h2>

          {alert.show && (
            <Alert
              variant={alert.title === "Course Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <div>
            <Label>Course *</Label>
            <Input
              ref={firstInputRef}
              tabIndex={1}
              type="text"
              className="capitalize"
              placeholder="Ex. Full Stack Developer"
              value={newCourse.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Duration Weeks *</Label>
            <Input
              type="text"
              tabIndex={2}
              placeholder="Enter Duration"
              value={newCourse.durationWeeks}
              onChange={(e) => handleChange("durationWeeks", e.target.value)}
            />
            {errors.durationWeeks && (
              <p className="text-sm text-red-500">{errors.durationWeeks}</p>
            )}
          </div>

          <div>
            <Label>Course Amount *</Label>
            <Input
              type="text"
              tabIndex={4}
              placeholder="Enter Amount"
              value={newCourse.totalAmount}
              onChange={(e) => handleChange("totalAmount", e.target.value)}
            />
            {errors.totalAmount && (
              <p className="text-sm text-red-500">{errors.totalAmount}</p>
            )}
          </div>

          <div>
            <Label> Payment Type *</Label>

            <div className="flex gap-4">
              <Checkbox
                className="h-5 w-5"
                checked={oneTime}
                onChange={(value) => handleTypesCheck("ONE_TIME")}
              />
              <Label> ONE_TIME</Label>

              <Checkbox
                className="h-5 w-5"
                checked={installment}
                onChange={(value) => handleTypesCheck("INSTALLMENT")}
              />
              <Label> INSTALLMENTS</Label>
            </div>
          </div>
          {/* <div>
            <Label>Select Payment Type *</Label>
            <div className="relative">
              <Select
                options={paymentType}
                placeholder="Select an option"
                onChange={(value) => handleChange("paymentType", value)}
                className="dark:bg-dark-900"
                tabIndex={5}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.paymentType && (
              <p className="text-sm text-red-500">{errors.paymentType}</p>
            )}
          </div> */}

          {oneTime === true && (
            <div className="mt-4">
              <Label>One Time Payment</Label>

              <div className="mb-3 flex items-center gap-3">
                <Input
                  type="text"
                  className="w-32"
                  value="ONE_TIME"
                  placeholder="Installment No."
                  disabled
                />

                <Input
                  type="text"
                  className="w-48"
                  value={newCourse.totalAmount}
                  placeholder="Amount"
                  readOnly
                />
              </div>
            </div>
          )}

          {installment === true && (
            <div className="mt-4">
              <Label>Installments Payments</Label>

              {installments.map((item, index) => (
                <div key={index} className="mb-3 flex items-center gap-3">
                  <Input
                    type="text"
                    className="w-32"
                    value={item.installment}
                    placeholder="Installment No."
                    disabled
                  />

                  <Input
                    type="text"
                    className="w-48"
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
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}

              <Button size="sm" variant="outline" onClick={addInstallment}>
                + Add Installment
              </Button>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              tabIndex={7}
              onClick={handleResetForm}
            >
              Clear
            </Button>
            <Button size="sm" tabIndex={8} variant="primary"  className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
