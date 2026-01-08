"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

import Alert from "@/components/ui/alert/Alert";
import { useDispatch } from "react-redux";

import { useCreateFaculty } from "@/hooks/useCreateFaculty";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { redirect } from "next/navigation";
import { getBatch, getCourse } from "@/lib/api";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { useFacultyStore } from "@/store/facultyStore";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/useQueryFetchBatchData";

interface CourseData {
  email: string;
  contact: string;
  joiningDate: string;
  courseId: string;
  batchId: String;
  password: string;
  name: string; // ✅ this matches backend
}

export default function FacultyForm() {
  const [newFaculty, setNewFaculty] = useState<CourseData>({
    name: "",
    email: "",
    joiningDate: "",
    contact: "",
    courseId: "",
    batchId: "",
    password: "",
  });
  const router = useRouter();
  const { form, reset, setField } = useFacultyStore();
  const user = useSelector((state: RootState) => state.auth.user);
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

  const [errors, setErrors] = useState<Partial<CourseData>>({});
  const { mutate: createFaculty } = useCreateFaculty();
  const batch = useSelector((state: RootState) => state.batch.batches);
  const courses = useSelector((state: RootState) => state.course.courses);
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  const firstInputRef = useRef<HTMLInputElement>(null);

   const {
      data: courseData,
      isLoading: courseLoading,
      isError: courseError,
    } = useFetchCourse();
  
    const {
      data: batchData,
      isLoading: batchLoading,
      isError: batchError,
    } = useFetchAllBatches();

    useEffect(() => {
      if (courseData?.course) {
        dispatch(setCourses(courseData.course));
      };
    }, [courseData, dispatch]);
  
    useEffect(() => {
      console.log("get all batches data;", batchData);
      if (batchData?.batch) { 
        dispatch(setBatches(batchData.batch));
      };
    }, [batchData, dispatch]);
    console.log("get all batches data::::::::::::::::::::::::::::::::::::::::::::::::;", batchData);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  console.log("get User data In Faculty Create Form Modal;", user);
  console.log("get Course Info In Faculty Create Form Modal;", courses);

  console.log("get batch Info In Faculty Create Form Modal;", batch);

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
    if (!form || Object.keys(form).length === 0) return;

    setNewFaculty((prev) => ({
      ...prev,
      ...form,
    }));
  }, [form]);


  const handleDateChange = (field: keyof CourseData, value: string) => {
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

    // 🔥 save to store
    setField(field as string, formattedValue);

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
    const newErrors: Partial<CourseData> = {};

    if (!newFaculty.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newFaculty.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!newFaculty.password.trim()) {
      newErrors.password = "Password is required.";
    }

    if (!newFaculty.contact.trim()) {
      newErrors.contact = "contact is required.";
    }

    // if (!newFaculty.courseId.trim()) {
    //   newErrors.courseId = "Course is required.";
    // }
    if (!newFaculty.batchId.trim()) {
      newErrors.batchId = "Batch is required.";
    }
    if (!newFaculty.joiningDate.trim()) {
      newErrors.joiningDate = "Joinint Date is required.";
    }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = (field: keyof CourseData, value: string) => {
  //   setNewFaculty((prev) => {
  //     let updated = { ...prev, [field]: value };

  //     // 🧠 Auto-generate email if faculty name changes
  //     if (field === "name" && user?.instituteName) {
  //       const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
  //       const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
  //       updated.email = `${formattedName}@${institute}`;
  //     }

  //     // 🔥 SAVE TO ZUSTAND
  //     setField(field as string, updated[field]);

  //     return updated;
  //   });

  //   // 🔄 Reset any validation errors
  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

  const handleChange = (field: keyof CourseData, value: string) => {
  // Ensure value is always lowercase if it's the name
  let processedValue = field === "name" ? value.toLowerCase() : value;

  // 1️⃣ Update local UI state
  setNewFaculty((prev) => {
    const updated = { ...prev, [field]: processedValue };

    // Update email automatically when name changes
    if (field === "name" && user?.slug) {
      const formattedName = processedValue.trim().replace(/\s+/g, "");
      const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
      updated.email = `${formattedName}@${institute}`;
    }

    return updated;
  });

  // 2️⃣ Update ZUSTAND (outside render cycle)
  setField(field as string, processedValue);

  // 3️⃣ Clear validation errors
  setErrors((prev) => ({
    ...prev,
    [field]: "",
  }));
};


  // const handleChange = (field: keyof CourseData, value: string) => {
  //   // 1️⃣ Update local UI state
  //   setNewFaculty((prev) => {
  //     let updated = { ...prev, [field]: value };

  //     if (field === "name" && user?.instituteName) {
  //       const formattedName = value.trim().toLowerCase().replace(/\s+/g, "");
  //       const institute = user.slug.trim().toLowerCase().replace(/\s+/g, "");
  //       updated.email = `${formattedName}@${institute}`;
  //     }

  //     return updated;
  //   });

  //   // 2️⃣ Update ZUSTAND (outside render cycle)
  //   setField(field as string, value);

  //   // 3️⃣ Clear validation
  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

  const courseOptions = courses.map((course: any) => ({
    value: course.id.toString(),
    label: course.name,
  }));

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

    createFaculty(newFaculty, {
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
          title: "Faculty Created",
          message: "Your Faculty has been created successfully.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          //redirect("/dashboard/faculty");

          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("faculty Data:", newFaculty);
  console.log("faculty Data in store:", form);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Faculty" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6">Faculty Infomation</h2>

          {alert.show && (
            <Alert
              variant={alert.title === "Faculty Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <div>
            <Label>Faculty Name *</Label>
            <Input
              ref={firstInputRef}
              tabIndex={1}
              className="capitalize"
              type="text"
              placeholder="Ex. Full Stack Developer"
              value={newFaculty.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Username *</Label>
            <Input
              type="text"
              readOnly
              tabIndex={2}
              placeholder="Ex. Full Stack Developer"
              value={newFaculty.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>Password *</Label>
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
          </div>

          <div>
            <Label>Contact No. *</Label>
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

          <div>
            <Label>
              Select Course *{" "}
              <span className="text-[12px] text-gray-400">(optional)</span>
            </Label>
            <div className="relative" data-master="course">
              <Select
                tabIndex={5}
                options={courseOptions}
                placeholder="Select an option"
                onChange={(value) => handleChange("courseId", value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div>
            <Label>Select Batch *</Label>
            <div className="relative" data-master="batch">
              <Select
                tabIndex={6}
                options={batchOptions}
                placeholder="Select an option"
                onChange={(value) => handleChange("batchId", value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.batchId && (
              <p className="text-sm text-red-500">{errors.batchId}</p>
            )}
          </div>

          <div>
            <Label>Joining Date *</Label>
            {/* <Input
            type="text"
            placeholder="Info Demo"
            value={newFaculty.joiningDate}
            onChange={(e) => handleChange("joiningDate", e.target.value)}         
          /> */}
            <input
              type="text"
              tabIndex={7}
              placeholder="10/10/2025"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={newFaculty.joiningDate}
              onChange={(e) => handleDateChange("joiningDate", e.target.value)}
            />
            {errors.joiningDate && (
              <p className="text-sm text-red-500">{errors.joiningDate}</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            {/* <Button
            size="sm"
            variant="outline"
            tabIndex={8}
            onClick={onCloseModal}
          >
            Close
          </Button> */}
            <Button size="sm" tabIndex={9} onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
