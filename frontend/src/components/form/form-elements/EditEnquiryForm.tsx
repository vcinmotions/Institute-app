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
import { useFetchAllCourses, useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useEditEnquiry } from "@/hooks/useEditEnquiry";
import { toast } from "sonner";
import { setError } from "@/store/slices/enquirySlice";
import MultiSelect from "../MultiSelect";

import {
  City,
  Country,
  ICity,
  ICountry,
  IState,
  State,
} from "country-state-city";
import { capitalizeWords } from "@/components/common/ToCapitalize";
import { normalizeEmail, normalizePhone, normalizeToLowercase, titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

type FormErrors = Partial<Record<keyof EnquiryData, string>>;

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
  alternateContact: string,
  location: string,
  city: string,
  gender: string,
  dob: string,
  referedBy: string,
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
    alternateContact: "",
    location: "",
    city: "",
    gender: "",
    dob: "",
    referedBy: "",
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
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const { inputRefs, scrollToError } = useScrollToError();

  const branchState = useSelector((state: RootState) => state.auth.statelocation);
    const branchCountry = useSelector((state: RootState) => state.auth.country);
     const [state, setState] = useState<IState[]>([]);
      const [city, setCity] = useState<ICity[]>([]);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchAllCourses();

  useEffect(() => {
      setState(State.getStatesOfCountry(branchCountry));
      const countryIso = branchCountry;
      const cities = City.getCitiesOfState(countryIso, branchState);
      setCity(cities);
    }, [])

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  const courseList = useSelector((state: RootState) => state.course.courses);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate: editEnquiry, isPending } = useEditEnquiry();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const scrollModalToTop = () => {
    modalBodyRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  console.log("Get Courses Name in Enquiry Form:", courses);

  const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  // useEffect(() => {
  //   if (enquiryData && Object.keys(enquiryData).length > 0) {
  //     console.log("🔥 Setting enquiry data to form:", enquiryData);

  //     // Extract course IDs from enquiryCourse array
  //     const courseIds: string[] = enquiryData.enquiryCourse
  //       ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
  //       : [];

  //     setNewEnquiry({
  //       id: enquiryData.id,
  //       name: enquiryData.name || "",
  //       email: enquiryData.email || "",
  //       courseId: courseIds, // ✅ set extracted course IDs
  //       alternateContact: enquiryData.alternateContact || "",
  //       location: enquiryData.location || "",
  //       city: enquiryData.city || "",
  //       gender: enquiryData.gender || "",
  //       dob: enquiryData.dob
  //       ? enquiryData.dob.split("T")[0] // ✅ FIX HERE
  //       : "",
  //       referedBy: enquiryData.referedBy || "",
  //       source: enquiryData.source || "",
  //       contact: enquiryData.contact || "",
  //     });
  //   }
  // }, [enquiryData]);

  useEffect(() => {
  if (!enquiryData) return;

  const courseIds = enquiryData.enquiryCourse
    ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
    : [];

  const splicedContact = enquiryData.contact
    ? enquiryData.contact.slice(-10) // last 10 digits
    : "";

  const splicedAlternateContact = enquiryData.alternateContact
    ? enquiryData.alternateContact.slice(-10) // last 10 digits
    : "";

  setNewEnquiry({
    id: enquiryData.id,
    name: enquiryData.name ?? "",
    email: enquiryData.email ?? "",
    contact: enquiryData.contact,
    alternateContact: enquiryData.alternateContact,
    location: enquiryData.location ?? "",
    city: enquiryData.city ?? "",
    gender: enquiryData.gender ?? "",
    dob: enquiryData.dob ? enquiryData.dob.split("T")[0] : "",
    referedBy: enquiryData.referedBy ?? "",
    source: enquiryData.source ?? "",
    courseId: courseIds,
  });
}, [enquiryData]);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  console.log("Get Courses Name in Enquiry Form:", courseList);

  // const handlePhoneNumberChange = (
  //   phoneNumber: string,
  //   countryCode: string,
  // ) => {
  //   // If phoneNumber doesn't start with +, prepend selected country code
  //   let formattedNumber = phoneNumber;
  //   if (!phoneNumber.startsWith("+")) {
  //     formattedNumber = countryCode + phoneNumber.replace(/^0+/, ""); // remove leading zeros
  //   }

  //   setNewEnquiry((prev) => ({
  //     ...prev,
  //     contact: formattedNumber,
  //   }));

  //   setErrors((prev) => ({
  //     ...prev,
  //     contact: "",
  //   }));
  // };


  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
  let digitsOnly = phoneNumber.replace(/\D/g, "");

  // Remove country code digits if already present
  const countryDigits = code.replace("+", "");
  if (digitsOnly.startsWith(countryDigits)) {
    digitsOnly = digitsOnly.slice(countryDigits.length);
  }

  digitsOnly = digitsOnly.slice(0, 10);

  const formattedNumber = digitsOnly
    ? `${code}${digitsOnly}`
    : "";

  setNewEnquiry((prev) => ({
    ...prev,
    contact: formattedNumber,
  }));

  setErrors((prev) => ({
    ...prev,
    contact:
      digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
  }));
};

  const handleAlternatePhoneNumberChange = (
    phoneNumber: string,
    code: string
  ) => {
    let digitsOnly = phoneNumber.replace(/\D/g, "");

    const countryDigits = code.replace("+", "");
    if (digitsOnly.startsWith(countryDigits)) {
      digitsOnly = digitsOnly.slice(countryDigits.length);
    }

    digitsOnly = digitsOnly.slice(0, 10);

    const formattedNumber = digitsOnly
      ? `${code}${digitsOnly}`
      : "";

    setNewEnquiry((prev) => ({
      ...prev,
      alternateContact: formattedNumber,
    }));

    setErrors((prev) => ({
      ...prev,
      alternateContact:
        digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
    }));
  };

  //  const handleAlternatePhoneNumberChange = (
  //   phoneNumber: string,
  //   countryCode: string,
  // ) => {
  //   // If phoneNumber doesn't start with +, prepend selected country code
  //   let formattedNumber = phoneNumber;
  //   if (!phoneNumber.startsWith("+")) {
  //     formattedNumber = countryCode + phoneNumber.replace(/^0+/, ""); // remove leading zeros
  //   }

  //   setNewEnquiry((prev) => ({
  //     ...prev,
  //     alternateContact: formattedNumber,
  //   }));

  //   setErrors((prev) => ({
  //     ...prev,
  //     alternateContact: "",
  //   }));
  // };


  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newEnquiry.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newEnquiry.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    }

     if (newEnquiry.courseId.length === 0) {
      newErrors.courseId = "Select at least one course.";
    }

    // setErrors(newErrors);

    // setTimeout(() => setErrors({}), 1000);
    // return Object.keys(newErrors).length === 0;

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
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
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required fileds.",
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

      scrollModalToTop();

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 1000);

      return;
    }

    const normalizedEnquiry = {
      ...newEnquiry,
      name: titleCase(newEnquiry.name),
      email: normalizeEmail(newEnquiry.email),
      contact: normalizePhone(newEnquiry.contact),
      alternateContact: normalizePhone(newEnquiry.alternateContact),
      location: normalizeToLowercase(newEnquiry.location),
    };

    editEnquiry(normalizedEnquiry, {
      onSuccess: () => {
        setNewEnquiry({
          id: "",
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

        scrollModalToTop();

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
        scrollModalToTop();
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET ENQUIRY FORM DATA", newEnquiry);

  return (
    <ModalCard title="Edit Enquiry" oncloseModal={onCloseModal} onBodyRef={(el) => (modalBodyRef.current = el)}>
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
        <div  ref={(el) => {
                inputRefs.current.name = el;
              }}>
          <Label>Name</Label>
          <Input
            ref={firstInputRef}
            type="text"
            placeholder="Enter Name"
            value={titleCase(newEnquiry.name)}
            tabIndex={1}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div  ref={(el) => {
                inputRefs.current.email = el;
              }}>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="Enter Email"
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
        <div  ref={(el) => {
                inputRefs.current.contact = el;
              }}>
          <Label>Contact No.</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
             tabIndex={3}
            value={newEnquiry.contact}
            placeholder="Enter Contact"
            onChange={handlePhoneNumberChange}
          />
          {errors.contact && (
            <p className="text-sm text-red-500">{errors.contact}</p>
          )}
        </div>{" "}

        
          <div>
          <Label>Alternate Conatct No.</Label>
          <PhoneInput
           tabIndex={4}
           countries={countries}
           value={newEnquiry.alternateContact} // ← fixed // <-- THIS FIXES IT
           placeholder="Enter alternate Contact" 
           onChange={handleAlternatePhoneNumberChange}
          />
           {errors.alternateContact && <p className="text-red-500 text-sm">{errors.alternateContact}</p>}
        </div>{" "}

        <div>
          <div className="relative">
            <MultiSelect
              tabIndex={9}
              label="Select Courses"
              options={courseList.map((course) => ({
                value: String(course.id),
                text: capitalizeWords(course.name),
                selected: newEnquiry.courseId.includes(String(course.id)), // optional if MultiSelect uses selected prop
              }))}
              value={newEnquiry.courseId} // 🔥 CONTROLLED VALUE
              onChange={(value) => handleChange("courseId", value)}
            />
          </div>
          {errors.courseId && (
            <p className="text-sm text-red-500">{errors.courseId}</p>
          )}
        </div>

        <div>
          <Label>Date Of Birth</Label>
          <Input
            tabIndex={6}
            type="date"
            placeholder="Enter DoB"
            //maxLength={10} // e.g. 12:30 PM
            value={newEnquiry.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
        </div>

       <div>
          <Label>Gender</Label>

          <div className="relative">
            <Select
              tabIndex={7}
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

        

        {/* CITY */}
          <div>
            <Label>City *</Label>
            <Select
              options={city.map((c) => ({
                label: c.name,
                value: c.name, // city name is fine
              }))}
               tabIndex={8}
              placeholder="Select City"
              onChange={(value) => handleChange("city", value)}
              value={newEnquiry.city}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

        <div>
          <Label>Location</Label>
          <Input
            type="text"
            placeholder="Enter Location"
            value={normalizeToLowercase(newEnquiry.location)}
            tabIndex={9}
            onChange={(e) => handleChange("location", e.target.value)}         />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        

         <div>
          <Label>Source</Label>
          <Input
            type="text"
            placeholder="Enter Source"
            value={newEnquiry.source}
            tabIndex={10}
            onChange={(e) => handleChange("source", e.target.value)}         />
            {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
        </div>
        

         <div>
          <Label>Refered By</Label>
          <Input
            type="text"
            placeholder="Enter Refered Name"
            value={newEnquiry.referedBy}
            tabIndex={11}
            onChange={(e) => handleChange("referedBy", e.target.value)}         />
            {errors.referedBy && <p className="text-red-500 text-sm">{errors.referedBy}</p>}
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm" variant="outline" tabIndex={12} onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" tabIndex={13} className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
