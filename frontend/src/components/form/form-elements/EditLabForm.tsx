"use client";
import { MESSAGE_VISIBLE_MS } from "@/lib/uiTimings";
import TimePicker from "@/components/form/TimePicker";
import React, { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import Label from "../Label";
import Input from "../input/InputField";
import Button from "@/components/ui/button/Button";
import ModalCard from "@/components/common/ModalCard";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEditLab } from "@/hooks/useEditLab";
import { normalizeToLowercase, titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { textError, integerError } from "@/lib/validation";

type FormErrors = Partial<Record<keyof LabData, string>>;

interface LabFormProps {
  onCloseModal: () => void;
  labData: any;
  kind?: "LAB" | "CLASS";
}

// interface TimeSlot {
//   day: string;
//   startTime: string;
//   endTime: string;
// }

export interface TimeSlot {
  id?: number;
  day: string;
  startTime: string;
  endTime: string;
  allocatedPCs?: number; // <-- FIX
  availablePCs?: number; // optional but backend returns it
  allocations?: any[]; // optional but backend returns it
  totalPCs?: number;
}

interface LabData {
  name: string;
  location: string;
  totalPCs: number;
  timeSlots: TimeSlot[];
}

export default function EditLabForm({ onCloseModal, labData, kind = "LAB" }: LabFormProps) {
  const isClass = kind === "CLASS";
  const noun = isClass ? "Class" : "Lab";
  console.log("GET LAB DATA IN EDIT LAB FORM:", labData);
  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: editLab } = useEditLab();
  const { inputRefs, scrollToError } = useScrollToError();

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

  useEffect(() => {
    if (!labData) return;

    setLab({
      name: labData.name || "",
      location: labData.location || "",
      totalPCs: labData.totalPCs || 0,
      timeSlots: labData.timeSlots?.length
        ? labData.timeSlots.map((slot: any) => ({
          day: slot.day || "Daily",
          startTime: slot.startTime || "",
          endTime: slot.endTime || "",
          id: slot.id,
          allocatedPCs: slot.allocatedPCs,
          availablePCs: slot.availablePCs,
        }))
        : [{ day: "Daily", startTime: "", endTime: "" }],
    });
  }, [labData]);

  // 🔹 Handle input change
  const handleChange = (field: keyof LabData, value: string | number) => {
    setLab((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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
  };

  // 🔹 Add a new time slot
  const addTimeSlot = () => {
    setLab((prev) => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        { day: "Daily", startTime: "", endTime: "" },
      ],
    }));
  };

  // 🔹 Remove a time slot
  const removeTimeSlot = (index: number) => {
    const updatedSlots = lab.timeSlots.filter((_, i) => i !== index);
    setLab((prev) => ({ ...prev, timeSlots: updatedSlots }));
  };

  // 🔹 Basic validation
  const validate = () => {
    const newErrors: FormErrors = {};
    {
      const nameErr = textError(lab.name, `${noun} name`, { required: true, max: 60 });
      if (nameErr) newErrors.name = nameErr;
      const pcsErr = integerError(lab.totalPCs, isClass ? "Seats" : "Total PCs", { required: true, min: 1, max: 1000 });
      if (pcsErr) newErrors.totalPCs = pcsErr as any;
    }

    const isInvalidSlot = lab.timeSlots.some((slot) => {
      // Ignore completely empty slot
      if (!slot.startTime && !slot.endTime) return false;

      // If one is filled but not the other → invalid
      if (!slot.startTime || !slot.endTime) return true;

      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return startMinutes >= endMinutes;
    });

    if (!lab.timeSlots || lab.timeSlots.length === 0 || isInvalidSlot) {
      newErrors.timeSlots =
        "Add at least one valid time slot (start time must be before end time)." as any;
    }

    // if (
    //   !lab.timeSlots ||
    //   lab.timeSlots.length === 0 ||
    //   lab.timeSlots.some(
    //     (slot) =>
    //       !slot.startTime ||
    //       !slot.endTime ||
    //       slot.startTime >= slot.endTime
    //   )
    // ) {
    //   newErrors.timeSlots =
    //     "Add at least one valid time slot (start time must be before end time)." as any;
    // }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), MESSAGE_VISIBLE_MS);


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
      }, MESSAGE_VISIBLE_MS);

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
      }, MESSAGE_VISIBLE_MS);

      return;
    }

    const id = labData.id;
    console.log("GET LABDATA ID IN HABDLE SUBMIT:", id);

    const normalizedLab = {
      ...lab,
      kind,
      name: titleCase(lab.name),
      location: normalizeToLowercase(lab.location),
    }

    editLab(
      { lab: normalizedLab, id },
      {
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
            message: `${noun} updated successfully!`,
            variant: "Success",
          });

          setTimeout(() => {
            onCloseModal();
          }, 3000);
        },

        onError: (error: any) => {
          // Show the server's reason (duplicate name, not allowed, etc.) on screen.
          setAlert({ show: true, title: "Error", message: getApiErrorMessage(error), variant: "error" });
          setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), MESSAGE_VISIBLE_MS);
          // You already handle error via redux + toast
          window.scrollTo({ top: 0, behavior: "smooth" })
        },
      },
    );
  };

  console.log("GET UPDATED LAB FORM DATA:", lab);

  return (
    <ModalCard title={`Edit ${noun}`} oncloseModal={onCloseModal}>
      <div className="flex flex-col gap-6">

        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update the details below to modify the {isClass ? "class" : "lab"} configuration.
          </p>
        </div>

        {alert.show && (
          <Alert
            variant={alert.variant === "Success" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Lab Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {noun} Details
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div ref={(el) => { inputRefs.current.name = el; }}>
              <Label>{noun} Name *</Label>
              <Input
                ref={firstInputRef}
                type="text"
                placeholder="Ex. LAB-06"
                value={titleCase(lab.name)}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                type="text"
                placeholder="Ex. Building D - Floor 1"
                value={titleCase(lab.location)}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            <div ref={(el) => { inputRefs.current.totalPCs = el; }}>
              <Label>{isClass ? "Seats (student capacity) *" : "Total PCs *"}</Label>
              <Input
                type="number"
                placeholder="Ex. 15"
                value={lab.totalPCs}
                onChange={(e) => handleChange("totalPCs", Number(e.target.value))}
              />
              {errors.totalPCs && (
                <p className="mt-1 text-sm text-red-500">{errors.totalPCs}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Time Slots */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Time Slots
          </h3>
          <div className="flex flex-col gap-4">
            {lab.timeSlots.map((slot, index) => {
              const isLocked = (slot.allocatedPCs ?? 0) > 0;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  ref={(el) => { inputRefs.current.timeSlots = el; }}
                >
                  <div className="w-full sm:w-1/3">
                    <Label className="sm:hidden">Day</Label>
                    <Input
                      type="text"
                      value={slot.day}
                      disabled={isLocked}
                      placeholder="Ex. Daily"
                      onChange={(e) =>
                        handleTimeSlotChange(index, "day", e.target.value)
                      }
                    />
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Label className="sm:hidden">Start Time</Label>
                    <TimePicker value={slot.startTime} onChange={(v) =>
                        handleTimeSlotChange(index, "startTime", v)} disabled={isLocked} />
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Label className="sm:hidden">End Time</Label>
                    <TimePicker value={slot.endTime} onChange={(v) =>
                        handleTimeSlotChange(index, "endTime", v)} disabled={isLocked} />
                  </div>

                  {lab.timeSlots.length > 1 && (
                    <div className="mt-6 sm:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        onClick={() => removeTimeSlot(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {errors.timeSlots && (
              <p className="mt-1 text-sm text-red-500">{errors.timeSlots}</p>
            )}

            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={addTimeSlot}>
                + Add Time Slot
              </Button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            onClick={handleSubmit}
          >
            Save Lab
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}
