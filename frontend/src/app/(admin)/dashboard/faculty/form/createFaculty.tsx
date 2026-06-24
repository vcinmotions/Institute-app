"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
// Assuming these are your standard imports based on your code:
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select"; // Assuming this is your Select component

import { useFacultyStore } from "@/store/facultyStore"; // Update path if needed
import { RootState } from "@/store"; // Update path if needed
import { setCourses } from "@/store/slices/courseSlice"; // Update path if needed
import { setBatches } from "@/store/slices/batchSlice"; // Update path if needed
import { titleCase, normalizeEmail, normalizePhone } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useFetchAllCourses, useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { useCreateFaculty } from "@/hooks/useCreateFaculty";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import { ChevronDownIcon } from "@/icons";

type FormErrors = Partial<Record<keyof FacultyData, string>>;

interface FacultyData {
  email: string;
  contact: string;
  joiningDate: string;
  courseId: string;
  batchId: string;
  password: string;
  name: string; // ✅ this matches backend
}

export default function FacultyForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { form, reset, setField } = useFacultyStore();
  const user = useSelector((state: RootState) => state.auth.user);

  const [newFaculty, setNewFaculty] = useState<FacultyData>({
    name: "",
    email: "",
    joiningDate: "",
    contact: "",
    courseId: "",
    batchId: "",
    password: "",
  });

  // Alert state
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

  const [errors, setErrors] = useState<FormErrors>({});
  const { inputRefs, scrollToError } = useScrollToError();
  const { mutate: createFaculty } = useCreateFaculty();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchAllCourses();

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches();

  const course = courseData?.course || [];
  const batch = batchData?.batch || [];

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  const courseOptions = course.map((course: any) => ({
    value: course.id.toString(),
    label: course.name,
  }));

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEnterPress = function (event: any) {
      if (event.keyCode === 13 && event.target.nodeName === "INPUT") {
        const form = event.target.form;
        if (form) {
          const index = Array.prototype.indexOf.call(form, event.target);
          if (form.elements[index + 2]) {
            form.elements[index + 2].focus();
            event.preventDefault();
          }
        }
      }
    };
    document.addEventListener("keydown", handleEnterPress);
    return () => document.removeEventListener("keydown", handleEnterPress);
  }, []);

  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewFaculty((prev) => ({
      ...prev,
      ...form,
    }));
  }, [form]);

  const handleDateChange = (field: keyof FacultyData, value: string) => {
    let digits = value.replace(/\D/g, "");

    if (digits.length > 8) digits = digits.slice(0, 8);

    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
    }

    setNewFaculty((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    setField(field as string, formattedValue);

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
    const newErrors: FormErrors = {};

    if (!newFaculty.name.trim()) newErrors.name = "Name is required.";
    if (!newFaculty.email.trim()) newErrors.email = "Email is required.";
    if (!newFaculty.password.trim()) newErrors.password = "Password is required.";
    if (!newFaculty.contact.trim()) newErrors.contact = "Contact is required.";
    if (!newFaculty.batchId.trim()) newErrors.batchId = "Batch is required.";
    if (!newFaculty.joiningDate.trim()) newErrors.joiningDate = "Joining Date is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    const formattedNumber = code + phoneNumber;

    setNewFaculty((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));

    setField("contact", formattedNumber);

    if (phoneNumber.length === 10) {
      setErrors((prev) => ({ ...prev, contact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        contact: "Phone number must be 10 digits",
      }));
    }
  };

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

  const handleChange = (field: keyof FacultyData, value: string) => {
    let processedValue = field === "name" ? value.toLowerCase() : value;

    setNewFaculty((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "name" && user?.slug) {
        const formattedName = processedValue.trim().replace(/\s+/g, "");
        const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
        updated.email = `${formattedName}@${institute}`;
      }
      return updated;
    });

    setField(field as string, value);

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

    const normalizedFaculty = {
      ...newFaculty,
      name: titleCase(newFaculty.name),
      email: normalizeEmail(newFaculty.email),
      contact: normalizePhone(newFaculty.contact),
    };

    createFaculty(normalizedFaculty, {
      onSuccess: () => {
        setNewFaculty({
          email: "",
          joiningDate: "",
          name: "",
          contact: "",
          courseId: "",
          batchId: "",
          password: "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        setAlert({
          show: true,
          title: "Faculty Created",
          message: "Your Faculty has been created successfully.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          router.back();
        }, 1000);
      },
      onError: () => {
        // Handle error natively via redux/toast
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Faculty" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">Faculty Information</h2>
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">Fill in the details below to add a new system Faculty.</p>
          </div>

          {alert.show && (
            <Alert
              variant={alert.title === "Faculty Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* Form Grouping: Personal Information */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div ref={(el) => { if (inputRefs.current) inputRefs.current.name = el; }}>
                <Label>Faculty Name *</Label>
                <Input
                  ref={firstInputRef}
                  tabIndex={1}
                  type="text"
                  placeholder="Ex. Full Stack Developer"
                  value={titleCase(newFaculty.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.email = el; }}>
                <Label>Username *</Label>
                <Input
                  type="text"
                  readOnly
                  tabIndex={2}
                  placeholder="Generated Automatically"
                  value={newFaculty.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.password = el; }}>
                <Label>Password *</Label>
                <Input
                  type="text"
                  tabIndex={3}
                  placeholder="Enter Password"
                  value={newFaculty.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.contact = el; }}>
                <Label>Contact No. *</Label>
                <div className="relative">
                  <PhoneInput
                    selectPosition="start"
                    countries={countries}
                    tabIndex={4}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Contact"
                    onChange={handlePhoneNumberChange}
                  />
                  {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Form Grouping: Allocation Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Allocation Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label>
                  Select Course * <span className="text-[12px] text-gray-400">(optional)</span>
                </Label>
                <div className="relative" data-master="course">
                  <Select
                    tabIndex={5}
                    options={courseOptions}
                    placeholder="Select an option"
                    onChange={(value: string) => handleChange("courseId", value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.batchId = el; }}>
                <Label>Select Batch *</Label>
                <div className="relative" data-master="batch">
                  <Select
                    tabIndex={6}
                    options={batchOptions}
                    placeholder="Select an option"
                    onChange={(value: string) => handleChange("batchId", value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.batchId && <p className="mt-1 text-sm text-red-500">{errors.batchId}</p>}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.joiningDate = el; }}>
                <Label>Joining Date *</Label>
                <Input
                  type="text"
                  tabIndex={7}
                  placeholder="DD-MM-YYYY"
                  value={newFaculty.joiningDate}
                  onChange={(e) => handleDateChange("joiningDate", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.joiningDate && <p className="mt-1 text-sm text-red-500">{errors.joiningDate}</p>}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px] rounded border border-gray-300 bg-white py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              tabIndex={8}
              variant="primary"
              onClick={handleSubmit}
              className="min-w-[120px] rounded bg-gray-900 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save Faculty
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}