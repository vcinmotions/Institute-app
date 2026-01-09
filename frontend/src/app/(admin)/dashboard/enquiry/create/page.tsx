"use client";
import React, { useState, useEffect, useRef } from "react";

import { useEnquiryStore } from "@/store/enquiryStore";
import Button from "@/components/ui/button/Button";
import { useCreateEnquiry } from "@/hooks/useCreateEnquiry";
import Alert from "@/components/ui/alert/Alert";
import { ChevronDownIcon, EnvelopeIcon } from "@/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import {
  useFetchAllCourses,
  useFetchCourse,
} from "@/hooks/useQueryFetchCourseData";
import { toast } from "sonner";
import { setError } from "@/store/slices/enquirySlice";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { today, getLocalTimeZone } from "@internationalized/date";
import { redirect, useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { focusNextInput } from "@/app/utils/focusNext";
import MultiSelect from "@/components/form/MultiSelect";
import { Tooltip } from "@heroui/react";
import { capitalizeWords } from "@/components/common/ToCapitalize";
import {
  City,
  Country,
  ICity,
  ICountry,
  IState,
  State,
} from "country-state-city";

// interface EnquiryData {
//   name: string;
//   email: string;
//   courseId: string[];
//   source: string;
//   contact: string;
// }

interface EnquiryData {
  name: string;
  email: string;
  courseId: string[];
  alternateContact: string,
  location: string,
  city: string,
  gender: string,
  dob: string,
  referedBy: string,
  source: string;
  contact: string;
}

export default function EnquiryForm() {
  const { form, setField, reset } = useEnquiryStore();
  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    name: "",
    email: "",
    courseId: [],
    alternateContact: "",
    location: "",
    city: "",
    gender: "",
    dob: "",
    referedBy: "",
    source: "",
    contact: "",
  });
  const branchState = useSelector((state: RootState) => state.auth.statelocation);
  const branchCountry = useSelector((state: RootState) => state.auth.country);
   const [state, setState] = useState<IState[]>([]);
    const [city, setCity] = useState<ICity[]>([]);
  const courses = useSelector((state: RootState) => state.course.courses);

  const dispatch = useDispatch();
  const router = useRouter();

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

  const [errors, setErrors] = useState<Partial<EnquiryData>>({});
  const { mutate: createEnquiry } = useCreateEnquiry();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  
   const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(State.getStatesOfCountry(branchCountry));
    const countryIso = branchCountry;
    const cities = City.getCitiesOfState(countryIso, branchState);
    setCity(cities);
  }, [])

  // 🟢 Restore data from Zustand when page opens
  useEffect(() => {
    if (form) {
      setNewEnquiry((prev) => ({
        ...prev,
        ...form, // merge stored values
      }));
    }
  }, []);

  console.log("CURRENT PAGE IN  CREATE ENQUIRY FORM;", currentPage);

  useEffect(() => {
    if (Object.values(form).length > 0) {
      console.log("JUMPINPTREF");
      console.log(
        "JUMPINPTREF",
        Object.values(form) !== null,
        Object.values(form),
        Object.values(form).length >= 0,
      );
      jumpInputRef.current?.focus();
    } else {
      console.log("firstInputRef", !Object.values(form) !== null);

      console.log("firstInputRef");

      firstInputRef.current?.focus();
    }
  }, []);

  console.log("Get Courses Name in Enquiry Form:", courses);

  // const {
  //   data: courseData,
  //   isLoading: courseLoading,
  //   isError: courseError,
  // } = useFetchCourse();

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchAllCourses();

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  const courseList = useSelector((state: RootState) => state.course.courses);

  console.log("Get Courses Name in Enquiry Form:", courseList);
  console.log("Get Courses Name in Enquiry Form:", courseData);

  const error = useSelector((state: RootState) => state.enquiry.error);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 2000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

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

    setField("contact", formattedNumber); // <-- ADD THIS

    setErrors((prev) => ({
      ...prev,
      contact: "",
    }));
  };
  const validate = () => {
    const newErrors: Partial<EnquiryData> = {};

    if (!newEnquiry.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // if (!newEnquiry.email.trim()) {
    //   newErrors.email = "Email is required.";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email)) {
    //   newErrors.email = "Email is invalid.";
    // }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    }

    // if (!newEnquiry.course.trim()) {
    //   newErrors.course = "Course is required.";
    // }

    // if (!newEnquiry.source.trim()) {
    //   newErrors.source = "Source is required.";
    // }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof EnquiryData, value: string | string[]) => {
    // if (field === "city") {
    //   setNewEnquiry((prev) => ({
    //     ...prev,
    //     city: value,
    //   }));
    //   setField("city", value);
    //   return;
    // }

    setNewEnquiry((prev) => ({
      ...prev,
      [field]:
        (field === "name" || field === "location") && typeof value === "string"
          ? value.toLowerCase()
          : value,
    }));

  
    // setNewEnquiry((prev) => ({
    //   ...prev,
    //   [field]:
    //     field === "name" && typeof value === "string"
    //       ? value.toLowerCase()
    //       : value,
          
    // }));

    // setNewEnquiry((prev) => ({
    //   ...prev,
    //   [field]: value,
    // }));

    setField(field, value); // <-- IMPORTANT

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // const handleSubmit = async () => {
  //   console.log("Submitting enquiry data:", newEnquiry);

  //   if (!validate()) {
  //     console.warn("Validation failed:", errors);
  //     return;
  //   }

  //   try {
  //     await createEnquiry(newEnquiry);
  //     // alert("Enquiry created successfully!");
  //     setNewEnquiry({ name: "", email: "", course: "", source: "", contact: "" });
  //     setErrors({});

  //     // Wait 3 seconds before showing alert
  //       setAlert({
  //         show: true,
  //         title: "Enquiry Created",
  //         message: "Your enquiry has been successfully submitted.",
  //         variant: "success",
  //       });

  //     // Close modal after showing alert for 2 seconds (for example)
  //       setTimeout(() => {
  //         onCloseModal();
  //       }, 3000);

  //   } catch (error) {
  //     //alert("Failed to create enquiry.");
  //   }
  // };

  const handleClearForm = () => {
    reset();
    // setNewEnquiry({
    //   name: "",
    //   email: "",
    //   courseId: [],
    //   source: "",
    //   contact: "",
    // });
    setNewEnquiry({ name: "", email: "", courseId: [], source: "", alternateContact: "", location: "", city: "", gender: "", dob: "", referedBy: "", contact: "" });

    firstInputRef.current?.focus();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      focusNextInput(e.currentTarget as HTMLElement);
    }
  };

  const handleDateChange = (field: keyof EnquiryData, value: string) => {
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
    setNewEnquiry((prev) => ({
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

  const handleSubmit = () => {
    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
        variant: "error",
      });

       window.scrollTo({
          top: 0, behavior: "smooth"
        })

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

       window.scrollTo({
          top: 0, behavior: "smooth"
        })

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

      return;
    }

    createEnquiry(newEnquiry, {
      onSuccess: () => {
        // setNewEnquiry({
        //   name: "",
        //   email: "",
        //   courseId: [],
        //   source: "",
        //   contact: "",
        // });
        setNewEnquiry({ name: "", email: "", courseId: [], source: "", alternateContact: "", location: "", city: "", gender: "", dob: "", referedBy: "", contact: "" });

        window.scrollTo({
          top: 0, behavior: "smooth"
        })

        setAlert({
          show: true,
          title: "Enquiry Created",
          message: "Enquiry has been Successfully Created.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          router.back();
        }, 300);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET ENQUIRY FORM DATA", newEnquiry);
  console.log("GET ENQUIRY FORM DATA IN STORE", form);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Enquiry" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6 dark:text-gray-50 dark:border-gray-700">Enquiry Infomation</h2>
          {error && (
            <div className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {alert.show && (
            <Alert
              variant={alert.title === "Enquiry Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}
          <div>
            <Label>Name *</Label>
            <Input
              ref={firstInputRef}
              type="text"
              className="capitalize"
              placeholder="Info Demo"
              value={newEnquiry.name}
              tabIndex={1}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <Label>Email </Label>
            <div className="relative">
              <Input
                placeholder="info@gmail.com"
                type="text"
                className="pl-15.5"
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
            <Label>Contact No. *</Label>
            <div className="relative">
              <Input
                tabIndex={3}
                value={newEnquiry.contact} // ← fixed // <-- THIS FIXES IT
                placeholder="Enter Contact"
                onChange={(e) => handleChange("contact", e.target.value)}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
            </div>
          </div>{" "}

          <div>
          <Label>Alternate Conatct No.</Label>
          <Input
           tabIndex={4}
           value={newEnquiry.alternateContact} // ← fixed // <-- THIS FIXES IT
           placeholder="Enter alternate Contact" 
           onChange={(e) => handleChange("alternateContact", e.target.value)}
          />
           {errors.alternateContact && <p className="text-red-500 text-sm">{errors.alternateContact}</p>}
        </div>{" "}

       <div>
          <Label>Gender</Label>

          <div className="relative">
            <Select
              tabIndex={6}
              options={genders.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              placeholder="Select Gender"
              onChange={(value) => handleChange("gender", value)}
              value={newEnquiry.gender} // just the courseId string
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender}</p>
          )}
        </div>

        <div>
          <Label>Area</Label>
          <Input
            type="text"
            placeholder="Enter Area"
            className="capitalize"
            value={newEnquiry.location}
            tabIndex={7}
            onChange={(e) => handleChange("location", e.target.value)}         />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

         {/* CITY */}
          <div>
            <Label>City *</Label>
            <Select
              options={city.map((c) => ({
                label: c.name,
                value: c.name, // city name is fine
              }))}
              placeholder="Select City"
              onChange={(value) => handleChange("city", value)}
              value={newEnquiry.city}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

        {/* <div>
          <Label>DoB</Label>
          <Input
            type="text"
            placeholder="Enter Date of Birth"
            value={newEnquiry.dob}
            tabIndex={8}
            onChange={(e) => handleChange("dob", e.target.value)}         />
            {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div> */}

        <div>
          <Label>Date Of Birth</Label>
          <Input
            tabIndex={9}
            type="date"
            placeholder="30-02-2002"
            //maxLength={10} // e.g. 12:30 PM
            value={newEnquiry.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
        </div>

          {/* <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="info@gmail.com"
            value={newEnquiry.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <Label>Contact No.</Label>
          <Input
            type="text"
            placeholder="99999 99999"
            value={newEnquiry.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
          />
          {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
        </div> */}
          {/* <div>
          <Label>Course</Label>
          <Input
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={newEnquiry.course}
            onChange={(e) => handleChange("course", e.target.value)}        />
          {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
        </div> */}
          <div>
            <div className="relative" data-master="course">
              <MultiSelect
                ref={jumpInputRef}
                tabIndex={9}
                tooltip={true}
                content="Create Course if not in list."
                label="Select Courses *"
                options={courseList.map((course) => ({
                  value: String(course.id),
                  text: capitalizeWords(course.name),
                  selected: newEnquiry.courseId.includes(String(course.id)),
                }))}
                value={newEnquiry.courseId}
                onChange={(value) => handleChange("courseId", value)}
              />
              
            </div>
            {errors.courseId && (
              <p className="text-sm text-red-500">{errors.courseId}</p>
            )}
          </div>
          <div>
            <Label>Source </Label>
            <div className="relative">
              <Input
                placeholder="Enter Source"
                onChange={(e) => handleChange("source", e.target.value)}
                className="dark:bg-dark-900"
                value={newEnquiry.source} // Bind selected course
                tabIndex={10}
              />
              {/* <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span> */}
            </div>
            {errors.source && (
              <p className="text-sm text-red-500">{errors.source}</p>
            )}
          </div>

         <div>
          <Label>Refered By</Label>
          <Input
            type="text"
            placeholder="Enter Age"
            value={newEnquiry.referedBy}
            tabIndex={11}
            onChange={(e) => handleChange("referedBy", e.target.value)}         />
            {errors.referedBy && <p className="text-red-500 text-sm">{errors.referedBy}</p>}
        </div>
          
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              tabIndex={12}
              onClick={handleClearForm}
            >
              Clear
            </Button>
            <Button size="sm" tabIndex={13} onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
