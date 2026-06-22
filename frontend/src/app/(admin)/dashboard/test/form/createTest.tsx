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
import { useCreateTest } from "@/hooks/useCreateTest";

type FormErrors = Partial<Record<keyof TestData, string>>;

interface TestData {
  name: string;
  courseId: string;
  batchId: string;
  testDate: string;
  totalMarks: string;
  description: string;
}

export default function TestForm() {
  const router = useRouter();
  const { form, reset, setField } = useCourseStore();
  const [newTest, setNewTest] = useState<TestData>({
    name: "",
    courseId: "",
    batchId: "",
    testDate: "",
    totalMarks: "",
    description: "",
  });

  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    variant: string;
  }>({ show: false, title: "", message: "", variant: "" });

  const { inputRefs, scrollToError } = useScrollToError();
  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate: createTest } = useCreateTest();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  //  Fixed, explicit typing to prevent "never" compilation fallbacks
  const { data: courseData } = useFetchAllCourses() as { data: any };
  const { data: batchData } = useFetchAllBatches() as { data: any };

  console.log("COURSE DATA IN TEST CREATION:", courseData);
  console.log("BATCH DATA IN TEST CREATION:", batchData);

  // Safely evaluate incoming data layers without breaking type checking compilers
  const coursesArray = Array.isArray(courseData)
    ? courseData
    : (courseData as any)?.courses || (courseData as any)?.course || [];

  const batchesArray = Array.isArray(batchData)
    ? batchData
    : (batchData as any)?.batch || [];

  // ✅ DYNAMIC FILTERING: Only show batches tied to the chosen course
  const filteredBatches = batchesArray.filter((b: any) => {
    if (!newTest.courseId) return true; // Show all if no course has been selected yet
    return b.batchCourses?.some((bc: any) => bc.courseId.toString() === newTest.courseId);
  });

  const courseOptions = coursesArray.map((c: any) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const batchOptions = filteredBatches.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot?.startTime || ""} - ${b.labTimeSlot?.endTime || ""}`,
  }));

  const validate = (actionType: "DRAFT" | "PUBLISH") => {
    const newErrors: FormErrors = {};

    if (!newTest.name.trim()) newErrors.name = "Test name is required.";
    if (!newTest.courseId.trim()) newErrors.courseId = "Course selection is required.";
    if (!newTest.batchId.trim()) newErrors.batchId = "Batch selection is required.";

    // Strict evaluation parameters checks run ONLY on direct assignment launches
    if (actionType === "PUBLISH") {
      if (!newTest.testDate.trim()) newErrors.testDate = "Test execution date is required.";
      if (!newTest.totalMarks.trim() || isNaN(Number(newTest.totalMarks))) {
        newErrors.totalMarks = "Valid numerical marks are required.";
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof TestData, value: string) => {
    setNewTest((prev) => ({ ...prev, [field]: value }));
    setField(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));

    // Reset dependant batch value selection if the course scope shifts mid-fill
    if (field === "courseId") {
      setNewTest((prev) => ({ ...prev, batchId: "" }));
    }
  };

  const handleAction = () => {

    const normalizedTest = {
      ...newTest,
      name: titleCase(newTest.name),
    };

    createTest(normalizedTest, {
      onSuccess: () => {
        setAlert({
          show: true,
          title: "Success",
          message: "Master draft parameters template saved successfully.",
          variant: "Success",
        });
        reset();
        setTimeout(() => router.back(), 1200);
      },
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create & Assign Test" />
      <div className="form-container">
        <div className="flex flex-col gap-6">
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">
              Evaluation Builder
            </h2>
          </div>

          {alert.show && (
            <Alert
              variant={alert.variant === "Success" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* Test Name */}
              <div>
                <Label>Test Name *</Label>
                <Input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Ex. Mid-Term Evaluation"
                  value={newTest.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Course Selection */}
              <div>
                <Label>Select Course *</Label>
                <Select
                  options={courseOptions}
                  placeholder="Choose Course"
                  onChange={(val) => handleChange("courseId", val)}
                />
                {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
              </div>

              {/* Batch Selection */}
              <div>
                <Label>Select Target Batch *</Label>
                <Select
                  options={batchOptions}
                  value={newTest.batchId}
                  placeholder="Choose Target Batch"
                  onChange={(val) => handleChange("batchId", val)}
                />
                {errors.batchId && <p className="text-xs text-red-500 mt-1">{errors.batchId}</p>}
              </div>

              {/* Test Date */}
              <div>
                <Label>Test Execution Date (Optional for Draft)</Label>
                <Input
                  type="date"
                  value={newTest.testDate}
                  onChange={(e) => handleChange("testDate", e.target.value)}
                />
                {errors.testDate && <p className="text-xs text-red-500 mt-1">{errors.testDate}</p>}
              </div>

              {/* Total Marks */}
              <div>
                <Label>Total Marks (Optional for Draft)</Label>
                <Input
                  type="text"
                  placeholder="Ex. 100"
                  value={newTest.totalMarks}
                  onChange={(e) => handleChange("totalMarks", e.target.value)}
                />
                {errors.totalMarks && <p className="text-xs text-red-500 mt-1">{errors.totalMarks}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <Label>Test Instructions / Descriptions</Label>
                <textarea
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none"
                  rows={3}
                  placeholder="Provide scope parameters or criteria info..."
                  value={newTest.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button size="sm" variant="outline" onClick={() => router.back()}>Cancel</Button>

            <Button
              size="sm"
              className="min-w-[120px] rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
              onClick={() => handleAction()}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}