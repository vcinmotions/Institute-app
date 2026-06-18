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

type FormErrors = Partial<Record<keyof FacultyData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  facultyData: any;
  batch: any[];
  course: any[];
}

interface FacultyData {
  email: string;
  contact: string;
  joiningDate: string;
  courseId: string;
  batchId: string[];
  password: string;
  name: string;
}

export default function EditFacultyForm({
  onCloseModal,
  facultyData,
  batch,
  course,
}: DefaultInputsProps) {
  const [newFaculty, setNewFaculty] = useState<FacultyData>({
    name: "",
    email: "",
    joiningDate: "",
    contact: "",
    courseId: "",
    batchId: [],
    password: "",
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { inputRefs, scrollToError } = useScrollToError();

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

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const scrollModalToTop = () => {
    modalBodyRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches();

  useEffect(() => {
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch));
    }
  }, [batchData, dispatch]);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name}`,
  }));

  useEffect(() => {
    if (facultyData) {
      setNewFaculty({
        name: facultyData.name || "",
        email: facultyData.email || "",
        joiningDate: facultyData.joiningDate || "",
        contact: facultyData.contact || "",
        courseId: facultyData.courseId || "",
        batchId: facultyData.batches?.map((b: any) => b.id.toString()) || [],
        password: facultyData.password || "",
      });
    }
  }, [facultyData]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newFaculty.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newFaculty.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!newFaculty.contact.trim()) {
      newErrors.contact = "Contact is required.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof FacultyData, value: string | string[]) => {
    setNewFaculty((prev) => {
      let updated = { ...prev, [field]: value };

      // Auto-generate email if faculty name changes
      if (field === "name" && typeof value === "string" && user?.instituteName) {
        const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
        const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
        updated.email = `${formattedName}@${institute}`;
      }

      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "+" &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    let digitsOnly = phoneNumber.replace(/\D/g, "");

    const countryDigits = code.replace("+", "");
    if (digitsOnly.startsWith(countryDigits)) {
      digitsOnly = digitsOnly.slice(countryDigits.length);
    }

    digitsOnly = digitsOnly.slice(0, 10);

    const formattedNumber = digitsOnly ? `${code}${digitsOnly}` : "";

    setNewFaculty((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));

    setErrors((prev) => ({
      ...prev,
      contact: digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
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

      scrollToError(validationErrors);

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

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

      scrollModalToTop();

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 3000);

      return;
    }

    const id = facultyData.id;

    const normalizedFaculty = {
      ...newFaculty,
      name: titleCase(newFaculty.name),
      contact: normalizePhone(newFaculty.contact),
    };

    editFaculty(
      { newFaculty: normalizedFaculty, id },
      {
        onSuccess: () => {
          setNewFaculty({
            email: "",
            joiningDate: "",
            name: "",
            contact: "",
            courseId: "",
            batchId: [],
            password: "",
          });

          scrollModalToTop();

          setAlert({
            show: true,
            title: "Faculty Updated",
            message: "Your Faculty has been updated successfully.",
            variant: "success",
          });

          setTimeout(() => {
            onCloseModal();
          }, 500);
        },

        onError: () => {
          scrollModalToTop();
        },
      },
    );
  };

  return (
    <ModalCard
      title="Update Faculty"
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">

        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the details below to modify the faculty record.
          </p>
        </div>

        {alert.show && (
          <Alert
            variant={alert.title === "Faculty Updated" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Personal Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div ref={(el) => { inputRefs.current.name = el; }}>
              <Label>Faculty Name *</Label>
              <Input
                ref={firstInputRef}
                type="text"
                tabIndex={1}
                placeholder="Ex. Full Stack Developer"
                value={newFaculty.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.email = el; }}>
              <Label>Email</Label>
              <Input
                type="text"
                tabIndex={2}
                readOnly
                placeholder="Ex. Full Stack Developer"
                value={newFaculty.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Assignments */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Contact &amp; Assignments
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div ref={(el) => { inputRefs.current.contact = el; }}>
              <Label>Contact No. *</Label>
              <PhoneInput
                selectPosition="start"
                countries={countries}
                tabIndex={3}
                value={newFaculty.contact}
                onKeyDown={handleKeyDown}
                placeholder="Enter Contact"
                onChange={handlePhoneNumberChange}
              />
              {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
            </div>

            <div className="lg:col-span-2" ref={(el) => { inputRefs.current.courseId = el; }}>
              <div className="relative">
                <MultiSelect
                  tabIndex={4}
                  label="Select Courses"
                  options={batchOptions.map((b) => ({
                    value: String(b.value),
                    text: b.label,
                    selected: newFaculty.batchId.includes(String(b.value)),
                  }))}
                  value={newFaculty.batchId}
                  defaultSelected={newFaculty.batchId}
                  onChange={(value: string[]) => handleChange("batchId", value)}
                />
              </div>
              {errors.courseId && <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            tabIndex={5}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
            tabIndex={6}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            onClick={handleSubmit}
          >
            Save Faculty
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}