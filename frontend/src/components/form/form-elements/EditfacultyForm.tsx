"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import { useCreateEnquiry } from "@/hooks/useCreateEnquiry";
import Alert from "@/components/ui/alert/Alert";
import { EnvelopeIcon } from "@/icons";
import PhoneInput from "../group-input/PhoneInput";
import { useCreateCourse } from "@/hooks/useCreateCourseData";
import { useCreateFaculty } from "@/hooks/useCreateFaculty";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useFocusOnEnter from "@/app/utils/UseFocusOnEnter";
import { useEditFaculty } from "@/hooks/useEditFaculty";

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
  batchId: String;
  password: string;
  name: string; // ✅ this matches backend
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
    batchId: "",
    password: "",
  });
  const user = useSelector((state: RootState) => state.auth.user);

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

  const [errors, setErrors] = useState<Partial<FacultyData>>({});
  const { mutate: editFaculty } = useEditFaculty();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const [batchList, setBatchList] = useState([]);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  console.log("get User data In Faculty Edit Form Modal;", user);
  console.log("get faculty data In Faculty Edit Form Modal;", facultyData);
  console.log("get Course Info In Faculty Edit Form Modal;", course);
  console.log("get labs Info In Faculty Edit Form Modal;", batch);

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
    if (facultyData) {
      setNewFaculty({
        name: facultyData.name || "",
        email: facultyData.email || "",
        joiningDate: facultyData.joiningDate || "",
        contact: facultyData.contact || "",
        courseId: facultyData.courseId || "", // only if facultyData has courseId
        batchId: facultyData.batchId || "", // only if facultyData has batchId
        password: facultyData.password || "",
      });
    }
  }, [facultyData]);

  const handleDateChange = (field: keyof FacultyData, value: string) => {
    // Allow only digits
    let digits = value.replace(/\D/g, "");

    // Restrict to max 8 digits (DDMMYYYY)
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-format as DD/MM/YYYY
    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }

    // Update form data
    setNewFaculty((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Simple validation (optional)
    let error = "";
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);
      const isValidDate = !isNaN(new Date(`${year}-${month}-${day}`).getTime());
      if (!isValidDate || day > 31 || month > 12) {
        error = "Invalid date";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setNewFaculty((prev) => ({
      ...prev,
      contact: phoneNumber,
    }));

    // Clear error if any
    setErrors((prev) => ({
      ...prev,
      contact: "",
    }));
  };

  const options = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "indeed", label: "Indeed" },
    { value: "instagram", label: "Instagram" },
    { value: "other", label: "Other" },
  ];

  const validate = () => {
    const newErrors: Partial<FacultyData> = {};

    if (!newFaculty.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newFaculty.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!newFaculty.contact.trim()) {
      newErrors.contact = "contact is required.";
    }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = (field: keyof CourseData, value: string) => {
  //   setNewFaculty((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  //   // Clear error on change
  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

  // const handleChange = (field: keyof CourseData, value: string) => {
  //   setNewFaculty((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));

  //   if (field === "courseId") {
  //     const selectedCourse = courses.find(c => c.id.toString() === value);
  //     if (selectedCourse?.batches) {
  //       setBatchList(selectedCourse.batches.map((b: any) => ({
  //         value: b.id.toString(),
  //         label: `${b.name} (${b.startTime} - ${b.endTime})`,
  //       })));
  //     } else {
  //       setBatchList([]);
  //     }
  //     setNewFaculty(prev => ({ ...prev, batch: "" }));
  //   }

  //   setErrors(prev => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

  const handleChange = (field: keyof FacultyData, value: string) => {
    setNewFaculty((prev) => {
      let updated = { ...prev, [field]: value };

      // 🧠 Auto-generate email if faculty name changes
      if (field === "name" && user?.instituteName) {
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

  const courseOptions = course.map((course: any) => ({
    value: course.id.toString(),
    label: course.name,
  }));

  // Helper to format ISO to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper to convert DD/MM/YYYY back to ISO
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`).toISOString();
  };

  const handleSubmit = async () => {
    console.log("Submitting enquiry data:", newFaculty);

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

    const id = facultyData.id;
    console.log("GET facultyData ID IN HABDLE SUBMIT:", id);

    editFaculty(
      { newFaculty, id },
      {
        onSuccess: () => {
          setNewFaculty({
            email: "",
            joiningDate: "",
            name: "",
            contact: "",
            courseId: "",
            batchId: "",
            password: "",
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

  console.log("faculty Data:", newFaculty);

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
            value={newFaculty.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="text"
            tabIndex={2}
            readOnly
            placeholder="Ex. Full Stack Developer"
            value={newFaculty.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* <div>
          <Label>Password</Label>
          <Input
            type="text"
            tabIndex={3}
            placeholder="password"
            value={newFaculty.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div> */}

        <div>
          <Label>Contact No.</Label>
          <Input
            type="text"
            tabIndex={4}
            placeholder="Info Demo"
            value={newFaculty.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
          />
          {errors.contact && (
            <p className="text-sm text-red-500">{errors.contact}</p>
          )}
        </div>

        {/* <div>
          <Label>Joining Date</Label>
          
          <Input
            type="text"
            tabIndex={7}
            placeholder="10/10/2025"
            disabled
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            value={formatDate(newFaculty.joiningDate)}
            onChange={(e) => handleDateChange("joiningDate", e.target.value)}
          />
          {errors.joiningDate && (
            <p className="text-sm text-red-500">{errors.joiningDate}</p>
          )}
        </div> */}

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={8}
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button size="sm" tabIndex={9} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
