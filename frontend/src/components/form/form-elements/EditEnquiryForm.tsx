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
  alternateContact: string;
  location: string;
  city: string;
  gender: string;
  dob: string;
  enquiryDate: string;
  referedBy: string;
  takenBy: string;
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
    enquiryDate: "",
    referedBy: "",
    takenBy: "",
    source: "",
    contact: "",
  });

  const dispatch = useDispatch();
  console.log("Get enquiry data to edit Enquiry:", enquiryData);

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
  }, []);

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

  const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (!enquiryData) return;

    const courseIds = enquiryData.enquiryCourse
      ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
      : [];

    const splicedContact = enquiryData.contact
      ? enquiryData.contact.slice(-10)
      : "";

    const splicedAlternateContact = enquiryData.alternateContact
      ? enquiryData.alternateContact.slice(-10)
      : "";

    setNewEnquiry({
      id: enquiryData.id,
      name: enquiryData.name ?? "",
      email: enquiryData.email ?? "",
      contact: splicedContact,
      alternateContact: splicedAlternateContact,
      location: enquiryData.location ?? "",
      city: enquiryData.city ?? "",
      gender: enquiryData.gender ?? "",
      dob: enquiryData.dob ? enquiryData.dob.split("T")[0] : "",
      enquiryDate: enquiryData.enquiryDate ? enquiryData.enquiryDate.split("T")[0] : "",
      referedBy: enquiryData.referedBy ?? "",
      takenBy: enquiryData.takenBy ?? "",
      source: enquiryData.source ?? "",
      courseId: courseIds,
    });
  }, [enquiryData]);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    const safePhone = phoneNumber || ""; // 🛡️

    let digitsOnly = safePhone.replace(/\D/g, "");

    const countryDigits = (code || "").replace("+", "");

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

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newEnquiry.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    }

    if (newEnquiry.courseId.length === 0) {
      newErrors.courseId = "Select at least one course.";
    }

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
        message: "Please enter required fields.",
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
          enquiryDate: "",
          referedBy: "",
          takenBy: "",
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
      },
    });
  };

  return (
    <ModalCard
      title="Edit Enquiry"
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">
        
        {/* Header & Alerts */}
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the details below to modify the system enquiry.
          </p>
        </div>

        {error && (
          <Alert variant="error" title="" message={error} showLink={false} />
        )}
        
        {alert.show && (
          <Alert
            variant={alert.title === "Enquiry Updated" ? "success" : "error"}
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
              <Label>Name *</Label>
              <Input
                ref={firstInputRef}
                type="text"
                placeholder="Enter Name"
                value={titleCase(newEnquiry.name)}
                tabIndex={1}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <Label>Gender</Label>
              <div className="relative">
                <Select
                  tabIndex={2}
                  options={genders.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  placeholder="Select Gender"
                  onChange={(value) => handleChange("gender", value)}
                  value={newEnquiry.gender}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>

            <div>
              <Label>Date Of Birth</Label>
              <Input
                tabIndex={3}
                type="date"
                placeholder="Enter DoB"
                value={newEnquiry.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
              {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Contact & Location
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div ref={(el) => { inputRefs.current.contact = el; }}>
              <Label>Contact No. *</Label>
              <PhoneInput
                selectPosition="start"
                countries={countries}
                tabIndex={4}
                value={newEnquiry.contact}
                placeholder="Enter Contact"
                onChange={handlePhoneNumberChange}
              />
              {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
            </div>

            <div>
              <Label>Alternate Contact No.</Label>
              <PhoneInput
                tabIndex={5}
                countries={countries}
                value={newEnquiry.alternateContact ?? ""}
                placeholder="Enter alternate Contact"
                onChange={handleAlternatePhoneNumberChange}
              />
              {errors.alternateContact && <p className="mt-1 text-sm text-red-500">{errors.alternateContact}</p>}
            </div>

            <div ref={(el) => { inputRefs.current.email = el; }}>
              <Label>Email</Label>
              <div className="relative">
                <Input
                  placeholder="Enter Email"
                  type="text"
                  className="pl-[60px]"
                  tabIndex={6}
                  value={newEnquiry.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <EnvelopeIcon />
                </span>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <Label>City</Label>
              <Select
                options={city.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
                tabIndex={7}
                placeholder="Select City"
                onChange={(value) => handleChange("city", value)}
                value={newEnquiry.city}
              />
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="lg:col-span-2">
              <Label>Location / Locality</Label>
              <Input
                type="text"
                placeholder="Enter Location"
                value={normalizeToLowercase(newEnquiry.location)}
                tabIndex={8}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Enquiry Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Enquiry Details
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            
            <div className="lg:col-span-2" ref={(el) => { inputRefs.current.courseId = el; }}>
              {/* <Label>Select Courses *</Label> */}
              <div className="relative">
                <MultiSelect
                  tabIndex={9}
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
              {errors.courseId && <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>}
            </div>

            <div>
              <Label>Enquiry Date</Label>
              <Input
                tabIndex={10}
                type="date"
                placeholder="Enter Enquiry Date"
                value={newEnquiry.enquiryDate}
                onChange={(e) => handleChange("enquiryDate", e.target.value)}
              />
              {errors.enquiryDate && <p className="mt-1 text-sm text-red-500">{errors.enquiryDate}</p>}
            </div>

            <div>
              <Label>Source</Label>
              <Input
                type="text"
                placeholder="Enter Source"
                value={newEnquiry.source}
                tabIndex={11}
                onChange={(e) => handleChange("source", e.target.value)}
              />
              {errors.source && <p className="mt-1 text-sm text-red-500">{errors.source}</p>}
            </div>

            <div>
              <Label>Referred By</Label>
              <Input
                type="text"
                placeholder="Enter Referred Name"
                value={newEnquiry.referedBy}
                tabIndex={12}
                onChange={(e) => handleChange("referedBy", e.target.value)}
              />
              {errors.referedBy && <p className="mt-1 text-sm text-red-500">{errors.referedBy}</p>}
            </div>

            <div>
              <Label>Taken By</Label>
              <Input
                type="text"
                placeholder="Taken by"
                value={newEnquiry.takenBy}
                tabIndex={13}
                onChange={(e) => handleChange("takenBy", e.target.value)}
              />
              {errors.takenBy && <p className="mt-1 text-sm text-red-500">{errors.takenBy}</p>}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button 
            size="sm" 
            variant="outline" 
            tabIndex={14} 
            onClick={onCloseModal}
          >
            Close
          </Button>
          <Button 
            size="sm" 
            tabIndex={15} 
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500" 
            onClick={handleSubmit}
          >
            Save Enquiry
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}