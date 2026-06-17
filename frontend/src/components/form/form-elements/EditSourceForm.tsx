"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";

import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";

import Alert from "@/components/ui/alert/Alert";

import PhoneInput from "../group-input/PhoneInput";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEditFaculty } from "@/hooks/useEditFaculty";
import { normalizePhone, titleCase } from "@/app/utils/Normalize";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { setBatches } from "@/store/slices/batchSlice";
import { countries } from "@/components/common/CountriesCode";
import { useScrollToError } from "@/app/utils/ScrollToError";
import MultiSelect from "../MultiSelect";

type FormErrors = Partial<Record<keyof SourceData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  sourceData: any;
}

interface SourceData {
  name: string; // ✅ this matches backend
}

export default function EditSourceForm({
  onCloseModal,
  sourceData,
}: DefaultInputsProps) {
  const [newSource, setNewSource] = useState<SourceData>({
    name: "",
  });
  const user = useSelector((state: RootState) => state.auth.user);
    const { inputRefs, scrollToError } = useScrollToError();


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

  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate: editFaculty } = useEditFaculty();
  const dispatch = useDispatch()
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  
  useEffect(() => {
    document.addEventListener("keydown", function (event: any) {
      if (event.keyCode === 13 && event.target.nodeName === "Input") {
        var form = event.target.form;
        var index = Array.prototype.indexOf.call(form, event.target);
        form.elements[index + 2].focus();
        event.preventDefault();
      }
    });
  }, []);

  useEffect(() => {
    if (sourceData) {
      setNewSource({
        name: sourceData.name || "",
      });
    }
  }, [sourceData]);


  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newSource.name.trim()) {
      newErrors.name = "Name is required.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof SourceData, value: string) => {
    setNewSource((prev) => ({
        ...prev,
        [field]: value,
    }));

    if (errors[field]) {
        setErrors((prev) => ({
        ...prev,
        [field]: "",
        }));
    }
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

    const id = sourceData.id;
    console.log("GET facultyData ID IN HABDLE SUBMIT:", id);

    const normalizedFaculty = {
              ...newSource,
              name: titleCase(newSource.name),
            };

    editFaculty(
      { newFaculty: normalizedFaculty, id },
      {
        onSuccess: () => {
          setNewSource({
            name: "",
          });

          setAlert({
            show: true,
            title: "Faculty Updated",
            message: "Your Faculty has been created successfully.",
            variant: "success",
          });

          setTimeout(() => {
            onCloseModal();
          }, 3000);
        },

        onError: () => {
          // You already handle error via redux + toast
        },
      },
    );
  };

  return (
    <ModalCard title="Update Faculty" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.title === "Faculty Updated" ? "success" : "error"}
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
            placeholder="Ex. Full Stack Developer"
            value={newSource.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>


        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={8}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button  size="sm" className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" tabIndex={9} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
