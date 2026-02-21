"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useEditCourse } from "@/hooks/useEditCourse";
import Checkbox from "../input/Checkbox";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useEditStationary } from "@/hooks/useEditStationary";

type FormErrors = Partial<Record<keyof CourseData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  stationaryData: CourseData;
}
interface CourseData {
  id: string;
  name: string,
  quantityAvailable: string;
}

export default function EditStationaryForm({
  onCloseModal,
  stationaryData,
}: DefaultInputsProps) {
  const [newStationary, setNewStationary] = useState<CourseData>({
    id: "",
    name: "",
    quantityAvailable: "",
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

  console.log("GET BATCH DATA IN EDIT COURSE FORM:", stationaryData);

  const { inputRefs, scrollToError } = useScrollToError();
  

    const [errors, setErrors] = useState<FormErrors>({});
  
  const { mutate: editStationary } = useEditStationary();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);



  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newStationary.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newStationary.quantityAvailable.trim()) {
      newErrors.quantityAvailable = "Course is required.";
    
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  useEffect(() => {
    if (!stationaryData) return;

    setNewStationary({
      id: String(stationaryData.id || ""),
      name: stationaryData.name || "",
      quantityAvailable: String(stationaryData.quantityAvailable || ""),
    });
  }, [stationaryData]);


  const handleChange = (field: keyof CourseData, value: string) => {

    setNewStationary((prev) => ({
      ...prev,
      [field]: value,
    }));

    // clear error for that field
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

       window.scrollTo({
            top: 0, behavior: "smooth"
          })

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return;
    }

    const id = stationaryData.id;
    console.log("GET LABDATA ID IN HABDLE SUBMIT:", id);

    const normalizedCourse = {
      ...newStationary,
      name: titleCase(newStationary.name),
    };


    editStationary(
      { newStationary: normalizedCourse, id },
      {
        onSuccess: () => {
          setNewStationary({
            id: "",
            quantityAvailable: "",
            name: "",

          });

          setAlert({
            show: true,
            title: "Stationary Created",
            message: "New stationary has been successfully Created.",
            variant: "success",
          });

          window.scrollTo({
            top: 0, behavior: "smooth"
          })

          setTimeout(() => {
            onCloseModal();
          }, 1000);
        },

        onError: () => {
          // You already handle error via redux + toast
          window.scrollTo({
            top: 0, behavior: "smooth"
          })
        },
      },
    );
  };

  console.log("GET NEW UPDATED COURSE DATA;", newStationary);

  return (
    <ModalCard title="Edit Course" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.title === "Stationary Created" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        <div>
          <Label>Course</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={titleCase(newStationary.name)}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label>Duration Weeks</Label>
          <Input
            type="number"
            tabIndex={2}
            min={0}
            placeholder="12"
            value={newStationary.quantityAvailable}
            onChange={(e) => handleChange("quantityAvailable", e.target.value)}
          />
          {errors.quantityAvailable && (
            <p className="text-sm text-red-500">{errors.quantityAvailable}</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={7}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button size="sm" className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" tabIndex={8} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
