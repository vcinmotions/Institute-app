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
import { useFetchAllCourses, useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { RootState } from "@/store";
import { useCreateTask } from "@/hooks/useCreatetTask";
import ModalCard from "@/components/common/ModalCard";
import { useEditTask } from "@/hooks/useEditTask";

type FormErrors = Partial<Record<keyof TaskData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  taskData: TaskData;
}

interface TaskData {
  id: string;
  batchId: string;
  courseId: string;
  name: string; // ✅ this matches backend
}

export default function EditTaskForm({
  onCloseModal,
  taskData,
}: DefaultInputsProps) {
  const router = useRouter();
  const { form, reset, setField } = useCourseStore();
  const [newTask, setNewTask] = useState<TaskData>({
    id: "",
    name: "",
    batchId: "",
    courseId: "",
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

  const { inputRefs, scrollToError } = useScrollToError();
  const [errors, setErrors] = useState<FormErrors>({});

  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const { mutate: editTask } = useEditTask();

  const dispatch = useDispatch();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskData) {
      setNewTask({
        id: taskData.id || "",
        courseId: taskData.courseId?.toString() || "",
        batchId: taskData.batchId?.toString() || "",
        name: taskData.name || "",
      });
    }
  }, [taskData]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

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

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    };
  }, [courseData, dispatch]);

  useEffect(() => {
    console.log("get all batches data;", batchData);
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch));
    };
  }, [batchData, dispatch]);
  console.log("get all batches data::::::::::::::::::::::::::::::::::::::::::::::::;", batchData);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name}`,
  }));

  const courseOptions = course.map((course: any) => ({
    value: course.id.toString(),
    label: course.name,
  }));

  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewTask((prev) => ({
      ...prev,
      name: form.name ?? prev.name,
      batchId: form.description ?? prev.batchId,
      courseId: form.durationMonths ?? prev.courseId,
    }));
  }, [form]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newTask.batchId.trim()) {
      newErrors.batchId = "Batch Id is required.";
    }

    if (!newTask.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newTask.courseId.trim()) {
      newErrors.courseId = "Course Id is required.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof TaskData, value: string) => {

    setNewTask((prev) => ({
      ...prev,
      [field]: value,
    }));

    setField(field, value); // <-- IMPORTANT

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

      scrollToError(validationErrors); // ✅ ALWAYS WORKS

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return; // ⛔ mutation never runs
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
      ...newTask,
      name: titleCase(newTask.name),
    };

    editTask({ newTask: normalizedCourse, id: newTask.id },
      {
        onSuccess: () => {
          setNewTask({
            id: "",
            batchId: "",
            courseId: "",
            name: "",
          });

          setAlert({
            show: true,
            title: "Task Updated",
            message: "Task has been updated successfully.",
            variant: "success",
          });

          reset();

          setTimeout(() => {
            // redirect("/dashboard/course");
            onCloseModal();
          }, 1000);
        },

        onError: () => {
          // You already handle error via redux + toast
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      });
  };

  console.log("GET COURSE DATA IN STORE:", form);
  console.log("GET NEW COURSE DATA:", newTask);

  return (
    <ModalCard title="Edit Course" oncloseModal={onCloseModal}>
      <div className="space-y-6">

        {alert.show && (
          <Alert
            variant={alert.title === "Task Updated" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        <div ref={(el) => {
          inputRefs.current.name = el;
        }}>
          <Label>Task Name *</Label>
          <Input
            ref={firstInputRef}
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={titleCase(newTask.name)}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <Label>
            Select Course *{" "}
          </Label>
          <div className="relative" data-master="course">
            <Select
              tabIndex={5}
              options={courseOptions}
              value={newTask.courseId}
              placeholder="Select an option"
              onChange={(value) => handleChange("courseId", value)}
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.courseId && (
            <p className="text-sm text-red-500">{errors.courseId}</p>
          )}
        </div>

        <div ref={(el) => {
          inputRefs.current.batchId = el;
        }}>
          <Label>Select Batch *</Label>
          <div className="relative" data-master="batch">
            <Select
              tabIndex={6}
              options={batchOptions}
              value={newTask.batchId}
              placeholder="Select an option"
              onChange={(value) => handleChange("batchId", value)}
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.batchId && (
            <p className="text-sm text-red-500">{errors.batchId}</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={8}
            onClick={onCloseModal}
          >
            Cancel
          </Button>
          <Button size="sm" variant="primary" className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
