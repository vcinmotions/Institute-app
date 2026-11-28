"use client";
import { MESSAGE_VISIBLE_MS } from "@/lib/uiTimings";
import React, { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
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
import { EyeIcon, EyeCloseIcon } from "@/icons";
import MultiSelect from "../MultiSelect";
import { mobileError, loginIdError, staffLoginId, personNameError, passwordError, onlyErrors } from "@/lib/validation";

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
  const [resetPassword, setResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        password: "",
      });
      setResetPassword(false);
    }
  }, [facultyData]);

  const validate = () => {
    const newErrors: FormErrors = {};

    // Same rules everywhere in the app (see lib/validation).
    Object.assign(newErrors, onlyErrors({
      name: personNameError(newFaculty.name),
      email: loginIdError(newFaculty.email, "Email / username"),
      contact: mobileError(newFaculty.contact, "Contact", true),
      password: resetPassword ? passwordError(newFaculty.password, "New password") : "",
    }));

    setErrors(newErrors);
    setTimeout(() => setErrors({}), MESSAGE_VISIBLE_MS);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof FacultyData, value: string | string[]) => {
    setNewFaculty((prev) => {
      let updated = { ...prev, [field]: value };

      // Auto-generate email if faculty name changes
      const loginId = field === "name" && typeof value === "string" ? staffLoginId(value, user) : null;
      if (loginId) updated.email = loginId; // e.g. google@2026

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
      contact: mobileError(digitsOnly, "Contact", true),
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
      }, MESSAGE_VISIBLE_MS);

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
      }, MESSAGE_VISIBLE_MS);

      return;
    }

    const id = facultyData.id;

    const { password: _pw, ...rest } = newFaculty;
    const normalizedFaculty = {
      ...rest,
      name: titleCase(newFaculty.name),
      contact: normalizePhone(newFaculty.contact),
      // Only send a password when the admin chose to reset it.
      ...(resetPassword && newFaculty.password ? { password: newFaculty.password } : {}),
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

        onError: (error: any) => {
          // Show the server's reason (duplicate name, not allowed, etc.) on screen.
          setAlert({ show: true, title: "Error", message: getApiErrorMessage(error), variant: "error" });
          setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), MESSAGE_VISIBLE_MS);
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
                placeholder="Ex. Full Stack Developer"
                value={newFaculty.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="order-last md:col-span-2 lg:col-span-3" ref={(el) => { inputRefs.current.password = el; }}>
              <Label>Password</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
<Input
                  type={showPassword ? "text" : "password"}
                  tabIndex={resetPassword ? 0 : -1}
                  disabled={!resetPassword}
                  placeholder={resetPassword ? "Enter new password" : "••••••••"}
                  value={newFaculty.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
{resetPassword && (
<button
 type="button"
 tabIndex={-1}
 onClick={() => setShowPassword((v) => !v)}
 aria-label={showPassword ? "Hide password" : "Show password"}
 className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
>
{showPassword ? (
<EyeIcon className="fill-gray-500 dark:fill-gray-400" />
) : (
<EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
)}
</button>
)}
</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (resetPassword) {
                      setResetPassword(false); setShowPassword(false);
                      handleChange("password", "");
                    } else {
                      setResetPassword(true);
                    }
                  }}
                >
                  {resetPassword ? "Cancel" : "Reset Password"}
                </Button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.email = el; }}>
              <Label>Email</Label>
              <Input
                type="text"
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
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button
            size="sm"
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