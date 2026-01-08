"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { ChevronDownIcon } from "@/icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateRolest } from "@/hooks/useCreateRoles"; // ✅ new hook
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { redirect } from "next/navigation";
import { useRoleStore } from "@/store/roleStore";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  const [errors, setErrors] = useState<Partial<RoleUserData>>({});
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
    { value: "VIEW_ONLY", label: "View Only" },
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

  console.log("GET USER DATA IN ROLE CREATE FORM:", user);
  const validate = () => {
    const newErrors: Partial<RoleUserData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.role.trim()) newErrors.role = "Please select a role.";

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = (field: keyof RoleUserData, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  //   setErrors((prev) => ({ ...prev, [field]: "" }));
  // };

  // const handleChange = (field: keyof RoleUserData, value: string) => {
  //   setFormData((prev) => {
  //     let updated = { ...prev, [field]: value };

  //     // 🧠 Auto-generate email if faculty name changes
  //     if (field === "name" && user?.name) {
  //       const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
  //       const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
  //       updated.email = `${formattedName}@${institute}`;
  //     }

  //     return updated;
  //   });

  //   // 🔄 Reset any validation errors
  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

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

  const handleResetForm = () => {
    reset();

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });
  };

  const handleSubmit = async () => {
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

    createRolesBasedAdmin(formData, {
      onSuccess: () => {
        setAlert({
          show: true,
          title: "Role Created",
          message: "New role-based user created successfully ✅",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          //redirect("/dashboard/roles");
          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET ROLE FORM DATA in STOre:", form);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Roles" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6">Roles Infomation</h2>
          {alert.show && (
            <Alert
              variant={alert.variant as any}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <div>
            <Label>Name</Label>
            <Input
              ref={firstInputRef}
              tabIndex={1}
              type="text"
              className="capitalize"
              placeholder="Ex. John Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Username</Label>
            <Input
              type="text"
              readOnly
              tabIndex={2}
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="text"
              tabIndex={3}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <Label>Assign Role</Label>
            <div className="relative">
              <Select
                tabIndex={4}
                options={roles}
                placeholder="Select Role"
                onChange={(value) => handleChange("role", value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              tabIndex={5}
              variant="outline"
              onClick={handleResetForm}
            >
              Clear
            </Button>
            <Button size="sm" tabIndex={6} onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
