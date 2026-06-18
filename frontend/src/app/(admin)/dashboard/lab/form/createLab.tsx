"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCreateLab } from "@/hooks/useCreateLab";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useLabStore } from "@/store/labStore";
import { useRouter } from "next/navigation";
import { normalizeToLowercase, titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

type FormErrors = Partial<Record<keyof LabData, string>>;

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface LabData {
  name: string;
  location: string;
  totalPCs: number;
  timeSlots: TimeSlot[];
}

export default function LabForm() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: createLab } = useCreateLab();
  const { form, setField, reset } = useLabStore();
  const { inputRefs, scrollToError } = useScrollToError();
  const router = useRouter();

  const [lab, setLab] = useState<LabData>({
    name: "",
    location: "",
    totalPCs: 0,
    timeSlots: [{ day: "Daily", startTime: "", endTime: "" }],
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Restore saved values when page loads
  useEffect(() => {
    setLab((prev) => ({
      ...prev,
      ...form,
    }));
  }, []);

  // 🔹 Handle input change
  const handleChange = (field: keyof LabData, value: string | number) => {
    setField(field, value); // <-- IMPORTANT
    setErrors((prev) => ({ ...prev, [field]: "" }));

    setLab((prev) => ({
      ...prev,
      [field]:
        field === "name" && typeof value === "string"
          ? value.toLowerCase()
          : value,
    }));
  };

  // 🔹 Handle time slot changes
  const handleTimeSlotChange = (
    index: number,
    field: keyof TimeSlot,
    value: string,
  ) => {
    const updatedSlots = [...lab.timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setLab((prev) => ({ ...prev, timeSlots: updatedSlots }));

    setField("timeSlots", updatedSlots);
  };

  // 🔹 Add a new time slot
  const addTimeSlot = () => {
    const updatedSlots = [
      ...lab.timeSlots,
      { day: "Daily", startTime: "", endTime: "" },
    ];

    setLab((prev) => ({
      ...prev,
      timeSlots: updatedSlots,
    }));

    // Save updated timeslots to Zustand
    setField("timeSlots", updatedSlots);
  };

  // 🔹 Remove a time slot
  const removeTimeSlot = (index: number) => {
    const updatedSlots = lab.timeSlots.filter((_, i) => i !== index);
    setLab((prev) => ({ ...prev, timeSlots: updatedSlots }));
  };

  // 🔹 Basic validation
  const validate = () => {
    const newErrors: FormErrors = {};
    if (!lab.name.trim()) newErrors.name = "Lab name is required.";
    // if (!lab.location.trim()) newErrors.location = "Location is required.";
    if (!lab.totalPCs || lab.totalPCs <= 0)
      newErrors.totalPCs = "Total PCs must be greater than 0." as any;
    if (
      !lab.timeSlots ||
      lab.timeSlots.length === 0 ||
      lab.timeSlots.some(
        (slot) =>
          !slot.startTime ||
          !slot.endTime ||
          slot.startTime >= slot.endTime
      )
    ) {
      newErrors.timeSlots =
        "Add at least one valid time slot (start time must be before end time)." as any;
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
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

      reset();

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 3000);

      return;
    }

    const normalizedLab = {
      ...lab,
      name: titleCase(lab.name),
      location: normalizeToLowercase(lab.location),
    }

    createLab(normalizedLab, {
      onSuccess: () => {
        // Reset form
        setLab({
          name: "",
          location: "",
          totalPCs: 0,
          timeSlots: [{ day: "Daily", startTime: "", endTime: "" }],
        });

        setAlert({
          show: true,
          title: "Success",
          message: "Lab created successfully!",
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

  console.log("GET LAB FORM DATA IN STORE:", form);
  console.log("GET LAB FORM DATA:", lab);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Lab" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">Lab Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to log a new system Lab.</p>
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

          {/* Form Grouping: Lab Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Lab Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.name = el;
                }}
              >
                <Label>Lab Name *</Label>
                <Input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Ex. LAB-06"
                  value={titleCase(lab.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.location = el;
                }}
              >
                <Label>Location</Label>
                <Input
                  type="text"
                  placeholder="Ex. Building D - Floor 1"
                  value={titleCase(lab.location)}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.totalPCs = el;
                }}
              >
                <Label>Total PCs *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ex. 15"
                  value={lab.totalPCs}
                  onChange={(e) => handleChange("totalPCs", Number(e.target.value))}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.totalPCs && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalPCs}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Grouping: Time Slots Configuration */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Time Slots Configuration
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.timeSlots = el;
                }}
              >
                <Label>Time Slots *</Label>

                <div className="mt-2 space-y-3">
                  {lab.timeSlots.map((slot, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3">
                      <Input
                        type="text"
                        tabIndex={4}
                        placeholder="Day (e.g., Daily)"
                        value={slot.day}
                        onChange={(e) => handleTimeSlotChange(index, "day", e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      {lab.timeSlots.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeTimeSlot(index)}
                          className="px-3 py-2"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {errors.timeSlots && (
                  <p className="mt-2 text-sm text-red-500">{errors.timeSlots}</p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={addTimeSlot}
                  className="mt-4 w-full border-dashed"
                >
                  + Add Time Slot
                </Button>
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
              Save Lab
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}