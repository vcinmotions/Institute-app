"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateBatch } from "@/hooks/useCreateBatch";
import { useFetchFaculty } from "@/hooks/useQueryFetchFaculty";
import { ChevronDownIcon } from "@/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFaculties } from "@/store/slices/facultySlice";

interface DefaultInputsProps {
  onCloseModal: () => void;
  labs: any[];
}

export default function BatchForm({ onCloseModal, labs }: DefaultInputsProps) {
  const [name, setName] = useState("");
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);

  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });

  const { mutate: createBatch } = useCreateBatch();
  const dispatch = useDispatch();

  const { data: facultyData } = useFetchFaculty();
  const facultyList = useSelector(
    (state: RootState) => state.faculty.faculties,
  );
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (facultyData?.faculty) {
      dispatch(setFaculties(facultyData.faculty));
    }
  }, [facultyData, dispatch]);

  // ✅ Validation
  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = "Batch name is required.";
    if (!selectedLab) newErrors.lab = "Please select a lab.";
    if (!selectedTimeSlot) newErrors.timeslot = "Please select a time slot.";

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit Handler (Matches Backend)
  const handleSubmit = async () => {
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

    const payload = {
      name,
      labTimeSlotId: Number(selectedTimeSlot),
      facultyId: selectedFaculty ? Number(selectedFaculty) : undefined,
    };

    createBatch(payload, {
      onSuccess: () => {
        setAlert({
          show: true,
          title: "Batch Created",
          message: "Batch added successfully ✅",
          variant: "success",
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
    <ModalCard title="Create New Batch" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* ✅ Batch Name */}
        <div>
          <Label>Batch Name</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="LAB-01 Morning Batch"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* ✅ Select Lab */}
        <div>
          <Label>Select Lab</Label>
          <div className="relative">
            <Select
              options={labs.map((l) => ({ label: l.name, value: l.id }))}
              onChange={(val) => {
                setSelectedLab(Number(val));
                const lab = labs.find((l) => l.id === Number(val));
                setTimeSlots(lab?.timeSlots ?? []);
                setSelectedTimeSlot(null);
              }}
              placeholder="Choose Lab"
              className="dark:bg-dark-900"
              tabIndex={2}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.lab && <p className="text-sm text-red-500">{errors.lab}</p>}
        </div>

        {/* ✅ Lab Time Slot */}
        <div>
          <Label>Select Time Slot</Label>
          <div className="relative">
            <Select
              options={timeSlots.map((ts) => ({
                label: `${ts.startTime} - ${ts.endTime} (Free PCs: ${ts.availablePCs})`,
                value: ts.id,
              }))}
              onChange={(val) => setSelectedTimeSlot(Number(val))}
              placeholder="Choose Time Slot"
              className="dark:bg-dark-900"
              tabIndex={3}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.timeslot && (
            <p className="text-sm text-red-500">{errors.timeslot}</p>
          )}
        </div>

        {/* ✅ Faculty Assign Optional */}
        <div>
          <Label>Assign Faculty (Optional)</Label>
          <div className="relative">
            <Select
              options={facultyList.map((f: any) => ({
                label: f.name,
                value: f.id,
              }))}
              onChange={(val) => setSelectedFaculty(Number(val))}
              placeholder="Select Faculty"
              className="dark:bg-dark-900"
              tabIndex={4}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* ✅ Action Buttons */}
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={5}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button size="sm" tabIndex={6} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
