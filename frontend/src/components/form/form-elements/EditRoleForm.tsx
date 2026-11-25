"use client";
import { MESSAGE_VISIBLE_MS } from "@/lib/uiTimings";
import { useAccessRoles } from "@/hooks/useAccessRoles";
import React, { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateRolest } from "@/hooks/useCreateRoles"; // ✅ new hook
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEditRoles } from "@/hooks/useEditRoles";
import { titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import CompanyAccessPicker, { CompanyAssignment } from "../CompanyAccessPicker";

type FormErrors = Partial<Record<keyof RoleUserData, string>>;

interface DefaultInputsProps {
  onCloseModal: () => void;
  roleData: any;
}

interface RoleUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function EditRolesForm({
  onCloseModal,
  roleData,
}: DefaultInputsProps) {
  const [formData, setFormData] = useState<RoleUserData>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const user = useSelector((state: RootState) => state.auth.user);
  const canResetPassword = user?.role === "ADMIN";
  const [resetPassword, setResetPassword] = useState(false);
  const [companies, setCompanies] = useState<CompanyAssignment[]>([]);
  const [multi, setMulti] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { inputRefs, scrollToError } = useScrollToError();
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

  useEffect(() => {
    if (!roleData) return;

    setFormData({
      name: roleData.name || "",
      email: roleData.email || "",
      password: "",
      role: roleData.customRoleId ? `custom:${roleData.customRoleId}` : roleData.role || "",
    });
    setResetPassword(false);
    // Companies this user can already work in (older users: just their own company).
    const existing: CompanyAssignment[] = (roleData.companyAccess ?? []).map((a: any) => ({
      companyId: a.clientAdminId,
      role: a.role,
    }));
    setCompanies(existing);
  }, [roleData]);

  const { mutate: editRolesBasedAdmin } = useEditRoles();

  const { data: accessRoles } = useAccessRoles();
  const roles = [
    { value: "FRONT_DESK", label: "Front Desk" },
    { value: "ACCOUNTANT", label: "Accountant" },
    { value: "VIEW_ONLY", label: "View Only" },
    ...(accessRoles?.roles ?? []).map((r) => ({ value: `custom:${r.id}`, label: `${r.name} (custom)` })),
  ];
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  console.log("GET USER DATA IN ROLE CREATE FORM:", user);
  console.log("GET ROLE DATA IN ROLE CREATE FORM:", roleData);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (multi) {
      if (companies.length === 0) newErrors.role = "Tick at least one company.";
    } else if (!formData.role.trim()) newErrors.role = "Please select a role.";

    if (resetPassword && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    setTimeout(() => setErrors({}), MESSAGE_VISIBLE_MS);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof RoleUserData, value: string) => {
    setFormData((prev) => {
      let updated = { ...prev, [field]: value };

      // 🧠 Auto-generate email if faculty name changes
      if (field === "name" && user?.slug) {
        const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
        const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");

        updated.email = `${formattedName}@${institute}`;
      }

      return updated;
    });

    // 🔄 Reset any validation errors
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
      }, MESSAGE_VISIBLE_MS);

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
      }, MESSAGE_VISIBLE_MS);

      return;
    }

    const id = roleData.id;
    console.log("GET roleData ID IN HABDLE SUBMIT:", id);

    const { password: _pw, ...rest } = formData;
    const normalizeRole = {
      ...rest,
      name: titleCase(formData.name),
      ...(multi ? { role: companies[0].role, companies } : {}),
      // Custom role (Role Access) or built-in role. null clears a previously assigned custom role.
      ...(!multi && formData.role.startsWith("custom:")
        ? { role: "VIEW_ONLY", customRoleId: Number(formData.role.split(":")[1]) }
        : { customRoleId: null }),
      // Only send a password when the admin chose to reset it.
      ...(canResetPassword && resetPassword && formData.password
        ? { password: formData.password }
        : {}),
    };

    editRolesBasedAdmin(
      { formData: normalizeRole, id },
      {
        onSuccess: () => {
          setAlert({
            show: true,
            title: "Role Updated",
            message: "Role-based user updated successfully ✅",
            variant: "success",
          });

          setTimeout(() => {
            onCloseModal();
          }, 2000);
        },

        onError: (error: any) => {
          // Show the server's reason (duplicate name, not allowed, etc.) on screen.
          setAlert({ show: true, title: "Error", message: getApiErrorMessage(error), variant: "error" });
          setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), MESSAGE_VISIBLE_MS);
          // You already handle error via redux + toast
        },
      }
    );
  };

  console.log("GET NEW UPDATE ROLE FORM DATA:", formData);

  return (
    <ModalCard title="Update Role-based User" oncloseModal={onCloseModal}>
      <div className="flex flex-col gap-6">

        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update the details and role assignment for this user below.
          </p>
        </div>

        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Section 1: Account Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Account Details
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              ref={(el) => {
                if (inputRefs.current) inputRefs.current.name = el;
              }}
            >
              <Label>Name *</Label>
              <Input
                ref={firstInputRef}
                type="text"
                placeholder="Ex. John Doe"
                value={titleCase(formData.name)}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div
              ref={(el) => {
                if (inputRefs.current) inputRefs.current.email = el;
              }}
            >
              <Label>Username *</Label>
              <Input
                type="text"
                readOnly
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {canResetPassword && (
              <div
                className="md:col-span-2"
                ref={(el) => {
                  if (inputRefs.current) inputRefs.current.password = el;
                }}
              >
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
<Input
                    type={showPassword ? "text" : "password"}
                    tabIndex={resetPassword ? 0 : -1}
                    disabled={!resetPassword}
                    placeholder={resetPassword ? "Enter new password" : "••••••••"}
                    value={formData.password}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Role Assignment */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Role Assignment
          </h3>
          <div className="grid grid-cols-1 gap-5">
            <div
              ref={(el) => {
                if (inputRefs.current) inputRefs.current.role = el;
              }}
            >
              <CompanyAccessPicker value={companies} onChange={setCompanies} onMulti={setMulti} defaultRole={formData.role || "FRONT_DESK"} />
              {!multi && <Label>Assign Role *</Label>}
              <div className={multi ? "hidden" : "relative"}>
                <Select
                  options={roles}
                  placeholder="Select Role"
                  value={formData.role}
                  onChange={(value) => handleChange("role", value)}
                  className="dark:bg-dark-900"
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
            Save Changes
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}