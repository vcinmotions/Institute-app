"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCourseStore } from "@/store/courseStore";
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
import { useFetchTestById } from "@/hooks/queries/useQueryFetchTestData";
import { useEditTest } from "@/hooks/useEditTest";

type FormErrors = Partial<Record<keyof TestData, string>>;

interface TestData {
    id: string;
    name: string;
    courseId: string;
    batchId: string;
    testDate: string;
    totalMarks: string;
    description: string;
}

interface EditTestFormProps {
    onCloseModal?: () => void;
    testData?: any;
}

export default function EditTestForm({ onCloseModal, testData }: EditTestFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { form, reset, setField } = useCourseStore();

    const urlTestId = searchParams.get("id");

    const [newTest, setNewTest] = useState<TestData>({
        id: "",
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
    const { mutate: editTest } = useEditTest();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { data: fetchedTestData, isLoading: isTestLoading } = useFetchTestById(
        !testData ? urlTestId : null
    );

    const activeTestData = testData || fetchedTestData;

    useEffect(() => {
        if (activeTestData) {
            setNewTest({
                id: activeTestData.id?.toString() || "",
                name: activeTestData.name || "",
                courseId: activeTestData.courseId?.toString() || activeTestData.course?.id?.toString() || "",
                batchId: activeTestData.batchId?.toString() || activeTestData.batch?.id?.toString() || "",
                testDate: activeTestData.testDate ? new Date(activeTestData.testDate).toISOString().split("T")[0] : "",
                totalMarks: activeTestData.totalMarks?.toString() || "",
                description: activeTestData.description || "",
            });
        }
    }, [activeTestData]);

    useEffect(() => {
        firstInputRef.current?.focus();
    }, []);

    const { data: courseData } = useFetchAllCourses() as { data: any };
    const { data: batchData } = useFetchAllBatches() as { data: any };

    const coursesArray = Array.isArray(courseData)
        ? courseData
        : (courseData as any)?.courses || (courseData as any)?.course || [];

    const batchesArray = Array.isArray(batchData)
        ? batchData
        : (batchData as any)?.batch || [];

    const filteredBatches = batchesArray.filter((b: any) => {
        if (!newTest.courseId) return true;
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

    useEffect(() => {
        if (!form || Object.keys(form).length === 0) return;
        setNewTest((prev) => ({
            ...prev,
            name: form.name ?? prev.name,
        }));
    }, [form]);

    const validate = (actionType: "DRAFT" | "PUBLISH") => {
        const newErrors: FormErrors = {};

        if (!newTest.name.trim()) newErrors.name = "Test name is required.";
        if (!newTest.courseId.trim()) newErrors.courseId = "Course selection is required.";
        if (!newTest.batchId.trim()) newErrors.batchId = "Batch selection is required.";

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

        if (field === "courseId") {
            setNewTest((prev) => ({ ...prev, batchId: "" }));
        }
    };

    const handleCancelClose = () => {
        if (onCloseModal) {
            onCloseModal();
        } else {
            router.back();
        }
    };

    // 🚀 FIXED: Dynamic routing action parameter pass tracker handler
    const handleAction = (actionType: "DRAFT" | "PUBLISH") => {
        const { isValid, errors: validationErrors } = validate(actionType);

        if (!isValid) {
            setAlert({
                show: true,
                title: "Validation Error",
                message: "Please fill out required Tracking fields.",
                variant: "error",
            });
            scrollToError(validationErrors);
            return;
        }

        const normalizedTestPayload = {
            id: newTest.id ? Number(newTest.id) : undefined, // matches backend body requirement checks
            name: titleCase(newTest.name),
            courseId: Number(newTest.courseId),
            batchId: Number(newTest.batchId),
            testDate: newTest.testDate || undefined,
            totalMarks: newTest.totalMarks ? Number(newTest.totalMarks) : undefined,
            description: newTest.description || "",
        };

        editTest(
            { newTest: normalizedTestPayload, id: newTest.id, action: actionType },
            {
                onSuccess: () => {
                    setAlert({
                        show: true,
                        title: "Success ✅",
                        message: actionType === "PUBLISH"
                            ? "Test changes assigned and published completely to active student databases."
                            : "Master draft parameters template updated successfully.",
                        variant: "Success",
                    });
                    reset();
                    setTimeout(() => handleCancelClose(), 1200);
                },
                onError: () => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            }
        );
    };

    if (isTestLoading) {
        return (
            <div className="flex items-center justify-center p-12 text-sm text-slate-500">
                Loading test specifications securely...
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Test Configurations" />
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
                            <div ref={(el) => { if (el) inputRefs.current.name = el; }}>
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
                                    value={newTest.courseId}
                                    placeholder="Choose Course"
                                    onChange={(val) => handleChange("courseId", val)}
                                />
                                {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
                            </div>

                            {/* Batch Selection */}
                            <div ref={(el) => { if (el) inputRefs.current.batchId = el; }}>
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
                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    rows={3}
                                    placeholder="Provide scope parameters or criteria info..."
                                    value={newTest.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                        <Button size="sm" variant="outline" onClick={handleCancelClose}>Cancel</Button>

                        <Button
                            size="sm"
                            className="min-w-[120px] rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                            onClick={() => handleAction("DRAFT")}
                        >
                            Save as Draft
                        </Button>

                        <Button size="sm" variant="primary" onClick={() => handleAction("PUBLISH")}>
                            Publish & Assign
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}