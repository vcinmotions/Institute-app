"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { ChevronDownIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateRolest } from "@/hooks/useCreateRoles"; // ✅ new hook
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRoleStore } from "@/store/roleStore";
import { useRouter } from "next/navigation";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

type FormErrors = Partial<Record<keyof RoleUserData, string>>;

interface RoleUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function RolesForm() {
  const [formData, setFormData] = useState<RoleUserData>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const { form, reset, setField } = useRoleStore();
  const user = useSelector((state: RootState) => state.auth.user);
  const { inputRefs, scrollToError } = useScrollToError();
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});

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

  const { mutate: createRolesBasedAdmin } = useCreateRolest();

  const roles = [
    { value: "FRONT_DESK", label: "Front Desk" },
    { value: "ACCOUNTANT", label: "Accountant" },
  ];

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...form,
    }));
  }, []);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.role.trim()) newErrors.role = "Please select a role.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof RoleUserData, value: string) => {
    let updatedValue = value;

    // 🧠 Auto-generate email when name changes
    if (field === "name" && user?.slug) {
      const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
      const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");

      const email = `${formattedName}@${institute}`;

      // Update local state
      setFormData((prev) => ({
        ...prev,
        name: value.toLocaleLowerCase(),
        email,
      }));

      // ✅ Update zustand OUTSIDE setState
      setField("name", value);
      setField("email", email);

      setErrors((prev) => ({ ...prev, name: "", email: "" }));
      return;
    }

    // Normal field update
    setFormData((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));

    // ✅ Safe Zustand update
    setField(field as string, updatedValue);

    // Clear validation
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
      }, 3000);

      return;
    }

    const normalizeRole = {
      ...formData,
      name: titleCase(formData.name)
    };

    createRolesBasedAdmin(normalizeRole, {
      onSuccess: () => {
        setAlert({
          show: true,
          title: "Role Created",
          message: "New role-based user created successfully ✅",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          router.back();
        }, 1000);
      },

      onError: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Roles" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">Roles Information</h2>
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">Fill in the details below to add a new role-based user.</p>
          </div>

          {alert.show && (
            <Alert
              variant={alert.variant as any}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* Form Grouping: Account Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Account Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div ref={(el) => { if (inputRefs.current) inputRefs.current.name = el; }}>
                <Label>Name *</Label>
                <Input
                  ref={firstInputRef}
                  tabIndex={1}
                  type="text"
                  placeholder="Ex. John Doe"
                  value={titleCase(formData.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.email = el; }}>
                <Label>Username *</Label>
                <Input
                  type="text"
                  readOnly
                  tabIndex={2}
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.password = el; }}>
                <Label>Password *</Label>
                <Input
                  type="text"
                  tabIndex={3}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div ref={(el) => { if (inputRefs.current) inputRefs.current.role = el; }}>
                <Label>Assign Role *</Label>
                <div className="relative">
                  <Select
                    tabIndex={4}
                    options={roles}
                    placeholder="Select Role"
                    onChange={(value) => handleChange("role", value)}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black appearance-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button
              size="sm"
              tabIndex={5}
              variant="outline"
              onClick={handleCancel}
              className="min-w-[100px] rounded border border-gray-300 bg-white py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              tabIndex={6}
              variant="primary"
              onClick={handleSubmit}
              className="min-w-[120px] rounded bg-gray-900 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              Save Role
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}