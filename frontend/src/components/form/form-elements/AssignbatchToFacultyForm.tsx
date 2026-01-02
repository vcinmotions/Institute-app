"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useAssignBatch } from "@/hooks/useAssignBatchToFaculty";

interface DefaultInputsProps {
  onCloseModal: () => void;
  courses: any[];
  batch: any[];
  faculty: any;
  title: string;
}

interface FacultyBatchData {
  name: string;
  email: string;
  batchId: string;
  facultyId: string;
}

export default function AssignBatchFacultyForm({
  onCloseModal,
  faculty,
  courses,
  batch,
  title,
}: DefaultInputsProps) {
  const [newFaculty, setNewFaculty] = useState<FacultyBatchData>({
    name: "",
    email: "",
    batchId: "",
    facultyId: "",
  });

  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });

  const [errors, setErrors] = useState<Partial<FacultyBatchData>>({});
  const { mutate: assignBatchToFaculty } = useAssignBatch();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // ✅ Auto–fill faculty details
  useEffect(() => {
    if (faculty) {
      setNewFaculty({
        name: faculty.name || "",
        email: faculty.email || "",
        batchId: "",
        facultyId: faculty.id.toString(),
      });
    }
  }, [faculty]);

  // ✅ Remove already assigned batch from dropdown
  const assignedBatchIds = faculty?.batches?.map((b: any) => b.id) || [];

  const filteredBatchOptions = batch
    .filter((b: any) => !assignedBatchIds.includes(b.id)) // exclude assigned batches
    .map((b: any) => ({
      value: b.id.toString(),
      label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
    }));

  const handleChange = (field: keyof FacultyBatchData, value: string) => {
    setNewFaculty((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Partial<FacultyBatchData> = {};
    if (!newFaculty.name.trim()) newErrors.name = "Name is required.";
    if (!newFaculty.email.trim()) newErrors.email = "Email is required.";
    if (!newFaculty.batchId.trim()) newErrors.batchId = "Batch is required.";
    if (!newFaculty.facultyId.trim())
      newErrors.facultyId = "Faculty ID is required.";
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

    console.log(
      "GET ASSIGN BATCH TO FACUlTY DATA BEFORE CREATION:",
      newFaculty,
    );

    assignBatchToFaculty(newFaculty, {
      onSuccess: () => {
        setNewFaculty({
          batchId: "",
          name: "",
          email: "",
          facultyId: "",
        });

        setAlert({
          show: true,
          title: "New Batch Assigned to Faculty.",
          message: "Successfully Assigned.",
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

  console.log("faculty Data:", newFaculty);
  console.log("filtered batches:", filteredBatchOptions);

  return (
    <ModalCard title={title} oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        <div>
          <Label>Faculty Name</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="Faculty Name"
            value={newFaculty.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled // optional: disable if you don’t want it edited
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label>Username</Label>
          <Input
            tabIndex={2}
            type="email"
            placeholder="Faculty Email"
            value={newFaculty.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled // optional: disable if you don’t want it edited
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <Label>Select Batch *</Label>
          <div className="relative">
            <Select
              tabIndex={3}
              options={filteredBatchOptions}
              placeholder={
                filteredBatchOptions.length > 0
                  ? "Select an available batch"
                  : "No available batches"
              }
              onChange={(value) => handleChange("batchId", value)}
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={4}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button size="sm" tabIndex={5} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
