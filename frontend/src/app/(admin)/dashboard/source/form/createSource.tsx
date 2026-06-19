"use client";

import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useDispatch } from "react-redux";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { titleCase } from "@/app/utils/Normalize";
import { useCreateSource } from "@/hooks/useCreateSource";

type FormErrors = Partial<Record<keyof SourceData, string>>;

interface SourceData {
  name: string; // ✅ this matches backend
}

export default function SourceForm() {
  const [newSource, setNewSource] = useState<SourceData>({
    name: "",
  });
  const router = useRouter();
  const dispatch = useDispatch();

  // Alert State
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
  const { inputRefs, scrollToError } = useScrollToError();
  const { mutate: createSource } = useCreateSource();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", function (event: any) {
      if (event.keyCode === 13 && event.target.nodeName === "Input") {
        var form = event.target.form;
        var index = Array.prototype.indexOf.call(form, event.target);
        if (form && form.elements[index + 2]) {
          form.elements[index + 2].focus();
          event.preventDefault();
        }
      }
    });
  }, []);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newSource.name?.trim()) {
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

  const handleSubmit = () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required inputs.",
        variant: "error",
      });

      scrollToError(validationErrors);

      setTimeout(() => {
        setAlert({
          show: false,
          title: "",
          message: "",
          variant: "",
        });
      }, 2000);

      return;
    }

    const normalizedSource = {
      ...newSource,
      name: titleCase(newSource.name),
    };

    createSource(normalizedSource, {
      onSuccess: () => {
        setNewSource({
          name: "",
        });

        setAlert({
          show: true,
          title: "Source Created",
          message: "Source created successfully.",
          variant: "success",
        });

        setTimeout(() => {
          router.back();
        }, 1000);
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Source" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">
              Source Information
            </h2>
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
              Fill in the details below to log a new system Source.
            </p>
          </div>

          {alert.show && (
            <Alert
              variant={alert.title === "Source Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* Form Grouping: Source Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Source Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.name = el;
                }}
              >
                <Label>Source Name *</Label>
                <Input
                  ref={firstInputRef}
                  tabIndex={1}
                  type="text"
                  placeholder="Ex. Google Ads, Referral"
                  value={titleCase(newSource.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px] rounded border border-gray-300 bg-white py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              tabIndex={2}
              variant="primary"
              onClick={handleSubmit}
              className="min-w-[120px] rounded bg-gray-900 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save Source
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}