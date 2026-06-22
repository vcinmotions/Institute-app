"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
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
import { useEditTest } from "@/hooks/useEditTest";
import ModalCard from "@/components/common/ModalCard";

type FormErrors = Partial<Record<keyof TestData, string>>;

interface DefaultInputsProps {
    onCloseModal: () => void;
    testData: any; // Incoming baseline data row instance
}

interface TestData {
    id: string;
    name: string;
    courseId: string;
    batchId: string;
    testDate: string;
    totalMarks: string;
    description: string;
}

export default function EditTestForm({
    onCloseModal,
    testData,
}: DefaultInputsProps) {
    const { form, reset, setField } = useCourseStore();
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

    // Hydrate the form data cleanly on open state changes
    useEffect(() => {
        if (testData) {
            setNewTest({
                id: testData.id?.toString() || "",
                name: testData.name || "",
                courseId: testData.courseId?.toString() || testData.course?.id?.toString() || "",
                batchId: testData.batchId?.toString() || testData.batch?.id?.toString() || "",
                // Handle raw or complex Date ISO strings coming from your database records safely
                testDate: testData.testDate ? new Date(testData.testDate).toISOString().split("T")[0] : "",
                totalMarks: testData.totalMarks?.toString() || "",
                description: testData.description || "",
            });
        }
    }, [testData]);

    useEffect(() => {
        firstInputRef.current?.focus();
    }, []);

    // Explicitly typed query destructuring to guarantee 'never' type-safety drops
    const { data: courseData } = useFetchAllCourses() as { data: any };
    const { data: batchData } = useFetchAllBatches() as { data: any };

    const coursesArray = Array.isArray(courseData) ? courseData : courseData?.courses || [];
    const batchesArray = batchData?.batch || [];

    // ✅ DYNAMIC FILTERING: Narrow target scope contextual assignments cleanly
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

    // Sync state changes downstream to store elements if tracked globally
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
        if (!newTest.courseId.trim()) newErrors.courseId = "Course context selection is required.";
        if (!newTest.batchId.trim()) newErrors.batchId = "Batch context selection is required.";

        if (actionType === "PUBLISH") {
            if (!newTest.testDate.trim()) newErrors.testDate = "Execution target date is required.";
            if (!newTest.totalMarks.trim() || isNaN(Number(newTest.totalMarks))) {
                newErrors.totalMarks = "Valid numerical test parameters required.";
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

    const handleAction = (actionType: "DRAFT" | "PUBLISH") => {
        const { isValid, errors: validationErrors } = validate(actionType);

        if (!isValid) {
            setAlert({
                show: true,
                title: "Validation Error",
                message: "Please fix form parameter validation inputs.",
                variant: "error",
            });
            scrollToError(validationErrors);
            return;
        }

        const normalizedTestPayload = {
            ...newTest,
            name: titleCase(newTest.name),
            totalMarks: newTest.totalMarks ? Number(newTest.totalMarks) : null,
            action: actionType,
        };

        editTest(
            {
                newTest: normalizedTestPayload,
                id: newTest.id,
                action: actionType // ✅ FIXED: Explicitly pass the action parameter here
            },
            {
                onSuccess: () => {
                    setAlert({
                        show: true,
                        title: "Test Updated",
                        message: actionType === "PUBLISH"
                            ? "Test changes saved and assignments pushed successfully."
                            : "Draft mutations mapped cleanly.",
                        variant: "success",
                    });
                    reset();
                    setTimeout(() => {
                        onCloseModal();
                    }, 1200);
                },
                onError: () => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            }
        );
    };

    return (
        <ModalCard title="Modify Test Configuration" oncloseModal={onCloseModal}>
            <div className="space-y-5">

                {alert.show && (
                    <Alert
                        variant={alert.variant === "success" ? "success" : "error"}
                        title={alert.title}
                        message={alert.message}
                        showLink={false}
                    />
                )}

                {/* Test Name */}
                <div ref={(el) => { inputRefs.current.name = el; }}>
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

                {/* Course Select Options */}
                <div>
                    <Label>Select Course Context *</Label>
                    <div className="relative">
                        <Select
                            options={courseOptions}
                            value={newTest.courseId}
                            placeholder="Change course connection context"
                            onChange={(value) => handleChange("courseId", value)}
                        />
                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                            <ChevronDownIcon />
                        </span>
                    </div>
                    {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
                </div>

                {/* Batch Select Options */}
                <div ref={(el) => { inputRefs.current.batchId = el; }}>
                    <Label>Select Target Batch Context *</Label>
                    <div className="relative">
                        <Select
                            options={batchOptions}
                            value={newTest.batchId}
                            placeholder="Change targeted batch context"
                            onChange={(value) => handleChange("batchId", value)}
                        />
                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                            <ChevronDownIcon />
                        </span>
                    </div>
                    {errors.batchId && <p className="text-xs text-red-500 mt-1">{errors.batchId}</p>}
                </div>

                {/* Test Execution Target Date */}
                <div>
                    <Label>Test Execution Date (Required for Publish)</Label>
                    <Input
                        type="date"
                        value={newTest.testDate}
                        onChange={(e) => handleChange("testDate", e.target.value)}
                    />
                    {errors.testDate && <p className="text-xs text-red-500 mt-1">{errors.testDate}</p>}
                </div>

                {/* Max Configuration Marks Fields */}
                <div>
                    <Label>Total Marks (Required for Publish)</Label>
                    <Input
                        type="text"
                        placeholder="Ex. 100"
                        value={newTest.totalMarks}
                        onChange={(e) => handleChange("totalMarks", e.target.value)}
                    />
                    {errors.totalMarks && <p className="text-xs text-red-500 mt-1">{errors.totalMarks}</p>}
                </div>

                {/* Description Scope parameters box text-area */}
                <div>
                    <Label>Test Instructions / Descriptions</Label>
                    <textarea
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        rows={3}
                        placeholder="Add parameter scope requirements changes..."
                        value={newTest.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </div>

                {/* Footer Action Controls Grid Wrapper Layout Row */}
                <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4 dark:border-gray-800">
                    <Button size="sm" variant="outline" onClick={onCloseModal}>
                        Cancel
                    </Button>

                    <Button
                        size="sm"
                        className="rounded border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        onClick={() => handleAction("DRAFT")}
                    >
                        Save as Draft
                    </Button>

                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAction("PUBLISH")}
                    >
                        Publish & Assign
                    </Button>
                </div>

            </div>
        </ModalCard>
    );
}