"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useFetchAllCourses } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { RootState } from "@/store";
import { useCreateTest } from "@/hooks/useCreateTest";

type FormErrors = Partial<Record<keyof TestData, string>>;

interface TestData {
  batchId: string;
  courseId: string;
  name: string;
}

export default function TestForm() {
  const router = useRouter();
  const { form, reset, setField } = useCourseStore();
  const [newTest, setNewTest] = useState<TestData>({
    name: "",
    batchId: "",
    courseId: "",
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

  const { inputRefs, scrollToError } = useScrollToError();
  const [errors, setErrors] = useState<FormErrors>({});

  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const { mutate: createTest } = useCreateTest();

  const dispatch = useDispatch();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const { data: courseData } = useFetchAllCourses();
  const { data: batchData } = useFetchAllBatches();

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  useEffect(() => {
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch));
    }
  }, [batchData, dispatch]);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  const courseOptions = course.map((course: any) => ({
    value: course.id.toString(),
    label: course.name,
  }));

  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewTest((prev) => ({
      ...prev,
      name: form.name ?? prev.name,
      batchId: form.description ?? prev.batchId,
      courseId: form.durationMonths ?? prev.courseId,
    }));
  }, [form]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newTest.name.trim()) {
      newErrors.name = "Test name is required.";
    }
    if (!newTest.courseId.trim()) {
      newErrors.courseId = "Course selection is required.";
    }
    if (!newTest.batchId.trim()) {
      newErrors.batchId = "Batch selection is required.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof TestData, value: string) => {
    setNewTest((prev) => ({
      ...prev,
      [field]: value,
    }));
    setField(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = () => {
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
      return;
    }

    const normalizedTest = {
      ...newTest,
      name: titleCase(newTest.name),
    };

    createTest(normalizedTest, {
      onSuccess: () => {
        setNewTest({
          batchId: "",
          courseId: "",
          name: "",
        });

        setAlert({
          show: true,
          title: "Success",
          message: "Test has been successfully created.",
          variant: "Success",
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
      <PageBreadcrumb pageTitle="Create Test" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">
              Test Information
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              Fill in the details below to log a new examination parameter.
            </p>
          </div>

          {/* Alert Messages */}
          {alert.show && (
            <Alert
              variant={alert.variant === "Success" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* Form Grouping: Test Configurations */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Examination Parameters
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* Test Name Input */}
              <div ref={(el) => { if (inputRefs.current) inputRefs.current.name = el; }}>
                <Label>Test Name *</Label>
                <Input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Ex. Mid-Term Evaluation"
                  value={titleCase(newTest.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Course Selection dropdown */}
              <div ref={(el) => { if (inputRefs.current) inputRefs.current.courseId = el; }}>
                <Label>Select Course *</Label>
                <div className="relative">
                  <Select
                    tabIndex={2}
                    options={courseOptions}
                    placeholder="Choose course option"
                    onChange={(value) => handleChange("courseId", value)}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>
                )}
              </div>

              {/* Batch Selection dropdown */}
              <div className="md:col-span-2 lg:col-span-1" ref={(el) => { if (inputRefs.current) inputRefs.current.batchId = el; }}>
                <Label>Select Batch *</Label>
                <div className="relative">
                  <Select
                    tabIndex={3}
                    options={batchOptions}
                    placeholder="Choose batch timetable"
                    onChange={(value) => handleChange("batchId", value)}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.batchId && (
                  <p className="mt-1 text-sm text-red-500">{errors.batchId}</p>
                )}
              </div>

            </div>
          </div>

          {/* Action Footer Wrapper Bar */}
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
              variant="primary"
              onClick={handleSubmit}
              className="min-w-[120px] rounded bg-gray-900 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save Test
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}