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
        form.elements[index + 2].focus();
        event.preventDefault();
      }
    });
  }, []);

  // useEffect(() => {
  //   if (!form || Object.keys(form).length === 0) return;

  //   setNewSource((prev) => ({
  //     ...prev,
  //     ...form,
  //   }));
  // }, [form]);

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


  const handleChange = (
      field: keyof SourceData,
      value: string
  ) => {
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Source" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">

        <div className="space-y-8">
          <h2 className="border-b pb-6 text-gray-900 dark:text-white/[0.87] dark:border-gray-700">Source Infomation</h2>

          {alert.show && (
            <Alert
              variant={alert.title === "Faculty Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <div ref={(el) => {
                inputRefs.current.name = el;
              }}>
            <Label>Source Name *</Label>
            <Input
              ref={firstInputRef}
              tabIndex={1}
              type="text"
              placeholder="Ex. Full Stack Developer"
              value={titleCase(newSource.name)}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            {/* <Button size="sm" variant="outline" onClick={handleResetForm}>
              Clear
            </Button> */}
            <Button size="sm" tabIndex={9} variant="primary"  className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
