"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Button from "@/components/ui/button/Button";
import ModalCard from "@/components/common/ModalCard";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCreateLab } from "@/hooks/useCreateLab";

interface LabFormProps {
  onCloseModal: () => void;
}

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

export default function LabForm({ onCloseModal }: LabFormProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: createLab } = useCreateLab();

  const [lab, setLab] = useState<LabData>({
    name: "",
    location: "",
    totalPCs: 0,
    timeSlots: [{ day: "Daily", startTime: "", endTime: "" }],
  });

  const [errors, setErrors] = useState<Partial<LabData>>({});
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
    const newErrors: Partial<LabData> = {};
    if (!lab.name.trim()) newErrors.name = "Lab name is required.";
    if (!lab.location.trim()) newErrors.location = "Location is required.";
    if (!lab.totalPCs || lab.totalPCs <= 0)
      newErrors.totalPCs = "Total PCs must be greater than 0." as any;
    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
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

    createLab(lab, {
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

        setTimeout(() => {
          onCloseModal();
        }, 3000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  return (
    <ModalCard title="Add New Lab" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.variant === "Success" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* 🔹 Lab Name */}
        <div>
          <Label>Lab Name</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="Ex. LAB-06"
            value={lab.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* 🔹 Location */}
        <div>
          <Label>Location</Label>
          <Input
            type="text"
            tabIndex={2}
            placeholder="Ex. Building D - Floor 1"
            value={lab.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* 🔹 Total PCs */}
        <div>
          <Label>Total PCs</Label>
          <Input
            tabIndex={3}
            type="number"
            placeholder="Ex. 15"
            value={lab.totalPCs}
            onChange={(e) => handleChange("totalPCs", Number(e.target.value))}
          />
          {errors.totalPCs && (
            <p className="text-sm text-red-500">{errors.totalPCs}</p>
          )}
        </div>

        {/* 🔹 Time Slots */}
        <div>
          <Label>Time Slots</Label>
          {lab.timeSlots.map((slot, index) => (
            <div key={index} className="mb-3 flex gap-3">
              <Input
                type="text"
                tabIndex={4}
                placeholder="Day (e.g., Daily)"
                value={slot.day}
                onChange={(e) =>
                  handleTimeSlotChange(index, "day", e.target.value)
                }
              />
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  handleTimeSlotChange(index, "startTime", e.target.value)
                }
              />
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  handleTimeSlotChange(index, "endTime", e.target.value)
                }
              />
              {lab.timeSlots.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeTimeSlot(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}

          <Button size="sm" variant="outline" onClick={addTimeSlot}>
            + Add Time Slot
          </Button>
        </div>

        {/* 🔹 Actions */}
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
