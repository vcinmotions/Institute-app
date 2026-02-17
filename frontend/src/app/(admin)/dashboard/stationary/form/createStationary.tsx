"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useStationaryStore } from "@/store/stationaryStore";
import { useCreateStationary } from "@/hooks/useCreateStationary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setError } from "@/store/slices/stationarySlice";

type FormErrors = Partial<Record<keyof StationaryData, string>>;

interface StationaryData {
  name: string; // ✅ this matches backend
  totalQuantity: string;
}


export default function StationaryForm() {
  const router = useRouter();
  const { form, reset, setField } = useStationaryStore();
  const [newStationary, setNewStationary] = useState<StationaryData>({
    name: "",
    totalQuantity: "",
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
  const error = useSelector((state: RootState) => state.stationary.error);
  const { mutate: createStationary } = useCreateStationary();
  const dispatch = useDispatch();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;

    setNewStationary((prev) => ({
      ...prev,
      name: form.name ?? prev.name,
      totalQuantity: form.totalQuantity ?? prev.totalQuantity,
    }));
  }, [form]);


  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newStationary.totalQuantity.trim()) {
      newErrors.totalQuantity = "Quantity is required.";
    }

    if (!newStationary.name.trim()) {
      newErrors.name = "Name is required.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


  const handleChange = (field: keyof StationaryData, value: string) => {

    setNewStationary((prev) => ({
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
      }, 2000);

      return;
    }

    const normalizedCourse = {
      ...newStationary,
      name: titleCase(newStationary.name),
    };

    createStationary(normalizedCourse, {
      onSuccess: () => {
        setNewStationary({
          totalQuantity: "",
          name: "",
        });

        setAlert({
          show: true,
          title: "Stationary Created",
          message: "Stationary has been successfully created.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          // redirect("/dashboard/course");
          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  console.log("GET COURSE DATA IN STORE:", form);
  console.log("GET NEW COURSE DATA:", newStationary);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Stationary" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">

        <div className="space-y-8">
          <h2 className="border-b pb-6 dark:text-gray-50 dark:border-gray-700">Stationary Infomation</h2>

          {alert.show && (
            <Alert
              variant={alert.title === "Stationary Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}
          {error && (
            <Alert
              variant={"error"}
              title={"Error"}
              message={error}
              showLink={false}
            />
          )}

          <div ref={(el) => {
                inputRefs.current.name = el;
              }}>
            <Label>Name *</Label>
            <Input
              ref={firstInputRef}
              type="text"
              placeholder="Ex. Full Stack Developer"
              value={titleCase(newStationary.name)}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div ref={(el) => {
                inputRefs.current.totalQuantity = el;
              }}>
            <Label>Quantity *</Label>
            <Input
              type="number"
              min={0}              // ✅ Prevents negatives
             
              placeholder="Enter Duration"
              value={newStationary.totalQuantity}
              onChange={(e) => handleChange("totalQuantity", e.target.value)}
            />
            {errors.totalQuantity && (
              <p className="text-sm text-red-500">{errors.totalQuantity}</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="primary"  className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
