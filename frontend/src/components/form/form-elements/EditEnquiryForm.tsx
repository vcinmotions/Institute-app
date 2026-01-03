"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";
import { useEditEnquiry } from "@/hooks/useEditEnquiry";
import { toast } from "sonner";
import { setError } from "@/store/slices/enquirySlice";
import MultiSelect from "../MultiSelect";

interface DefaultInputsProps {
  onCloseModal: () => void;
  courses: any[];
  enquiryData: any;
}

interface EnquiryData {
  id: string;
  name: string;
  email: string;
  courseId: string[];
  source: string;
  contact: string;
}

export default function EditEnquiryForm({
  onCloseModal,
  courses,
  enquiryData,
}: DefaultInputsProps) {
  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    id: "",
    name: "",
    email: "",
    courseId: [],
    source: "",
    contact: "",
  });

  const dispatch = useDispatch();
  console.log("GEt enquiry data to edit Enquiry:", enquiryData);

  //const course = useSelector((state: RootState) => state.course.courses);

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
  const error = useSelector((state: RootState) => state.enquiry.error);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const [errors, setErrors] = useState<Partial<EnquiryData>>({});
  const { mutate: editEnquiry, isPending } = useEditEnquiry();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  console.log("Get Courses Name in Enquiry Form:", courses);

  // useEffect(() => {
  //   if (enquiryData && Object.keys(enquiryData).length > 0) {
  //     console.log("🔥 Setting enquiry data to form:", enquiryData);

  //     setNewEnquiry({
  //       id: enquiryData.id,
  //       name: enquiryData.name || "",
  //       email: enquiryData.email || "",
  //       courseId: enquiryData.course || [],
  //       source: enquiryData.source || "",
  //       contact: enquiryData.contact || "",
  //     });
  //   }
  // }, [enquiryData]);

  useEffect(() => {
    if (enquiryData && Object.keys(enquiryData).length > 0) {
      console.log("🔥 Setting enquiry data to form:", enquiryData);

      // Extract course IDs from enquiryCourse array
      const courseIds: string[] = enquiryData.enquiryCourse
        ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
        : [];

      setNewEnquiry({
        id: enquiryData.id,
        name: enquiryData.name || "",
        email: enquiryData.email || "",
        courseId: courseIds, // ✅ set extracted course IDs
        source: enquiryData.source || "",
        contact: enquiryData.contact || "",
      });
    }
  }, [enquiryData]);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchCourse();

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  const courseList = useSelector((state: RootState) => state.course.courses);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  console.log("Get Courses Name in Enquiry Form:", courseList);

  const handlePhoneNumberChange = (
    phoneNumber: string,
    countryCode = "+91",
  ) => {
    // If phoneNumber doesn't start with +, prepend selected country code
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      formattedNumber = countryCode + phoneNumber.replace(/^0+/, ""); // remove leading zeros
    }

    setNewEnquiry((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));

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
    const newErrors: Partial<EnquiryData> = {};

    if (!newEnquiry.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // if (!newEnquiry.email.trim()) {
    //   newErrors.email = "Email is required.";
    // }

    // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email)) {
    //   newErrors.email = "Email is invalid.";
    // }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    }
    // else if (!/^\+\d{10,15}$/.test(newEnquiry.contact)) {
    //   newErrors.contact = "Contact must be 10 digits.";
    // }

    // if (!newEnquiry.courseId) {
    //   newErrors.courseId = "Course is required.";
    // }

    // if (!newEnquiry.source.trim()) {
    //   newErrors.source = "Source is required.";
    // }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof EnquiryData, value: string | string[]) => {
    setNewEnquiry((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = () => {
    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
        variant: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 1000);

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
      }, 1000);

      return;
    }

    editEnquiry(newEnquiry, {
      onSuccess: () => {
        setNewEnquiry({
          id: "",
          name: "",
          email: "",
          courseId: [],
          source: "",
          contact: "",
        });

        setAlert({
          show: true,
          title: "Enquiry Updated",
          message: "Enquiry has been Successfully Updated.",
          variant: "success",
        });

        setTimeout(() => {
          onCloseModal();
        }, 500);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET ENQUIRY FORM DATA", newEnquiry);

  return (
    <ModalCard title="Edit Enquiry" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {alert.show && (
          <Alert
            variant={alert.title === "Enquiry Updated" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}
        <div>
          <Label>Name</Label>
          <Input
            ref={firstInputRef}
            type="text"
            placeholder="Info Demo"
            value={newEnquiry.name}
            tabIndex={1}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="info@gmail.com"
              type="text"
              className="pl-[62px]"
              tabIndex={2}
              value={newEnquiry.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            value={newEnquiry.contact}
            placeholder="+91 55555 00000"
            onChange={handlePhoneNumberChange}
          />
          {errors.contact && (
            <p className="text-sm text-red-500">{errors.contact}</p>
          )}
        </div>{" "}
        <div>
          <div className="relative">
            <MultiSelect
              tabIndex={4}
              label="Select Courses"
              options={courseList.map((course) => ({
                value: String(course.id),
                text: course.name,
                selected: newEnquiry.courseId.includes(String(course.id)), // optional if MultiSelect uses selected prop
              }))}
              value={newEnquiry.courseId} // 🔥 CONTROLLED VALUE
              defaultSelected={newEnquiry.courseId}
              onChange={(value) => handleChange("courseId", value)}
            />
          </div>
          {errors.courseId && (
            <p className="text-sm text-red-500">{errors.courseId}</p>
          )}
        </div>
        <div>
          <Label>Select Source</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Select an option"
              value={newEnquiry.source} // Bind selected course
              onChange={(e) => handleChange("source", e.target.value)}
              className="dark:bg-dark-900"
            />
          </div>
          {errors.source && (
            <p className="text-sm text-red-500">{errors.source}</p>
          )}
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
