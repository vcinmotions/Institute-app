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
import { useFetchAllCourses } from "@/hooks/queries/useQueryFetchCourseData";
import { toast } from "sonner";
import { setError } from "@/store/slices/enquirySlice";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MultiSelect from "@/components/form/MultiSelect";
import {
  City,
  Country,
  ICity,
  ICountry,
  IState,
  State,
} from "country-state-city";
import { countries } from "@/components/common/CountriesCode";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { normalizeEmail, normalizePhone, normalizeToLowercase, titleCase } from "@/app/utils/Normalize";
import { useFetchAllSource, useFetchSource } from "@/hooks/queries/useQueryFetchSource";
import { setSources } from "@/store/slices/sourceSlice";
import PhoneNumberInput from "@/components/form/PhoneNumberInput";

type FormErrors = Partial<Record<keyof EnquiryData, string>>;

interface EnquiryData {
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
    enquiryDate: "",
    referedBy: "",
    takenBy: "",
    source: "",
    contact: "",
  });
  const branchState = useSelector((state: RootState) => state.auth.statelocation);
  const branchCountry = useSelector((state: RootState) => state.auth.country);
  const [state, setState] = useState<IState[]>([]);
  const [city, setCity] = useState<ICity[]>([]);

  const dispatch = useDispatch();
  const router = useRouter();

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

  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate: createEnquiry } = useCreateEnquiry();

  const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  const { inputRefs, scrollToError } = useScrollToError();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(State.getStatesOfCountry(branchCountry));
    const countryIso = branchCountry;
    const cities = City.getCitiesOfState(countryIso, branchState);
    setCity(cities);
  }, []);

  // 🟢 Restore data from Zustand when page opens
  useEffect(() => {
    if (form) {
      setNewEnquiry((prev) => ({
        ...prev,
        ...form, // merge stored values
      }));
    }
  }, []);

  useEffect(() => {
    if (Object.values(form).length > 0) {
      jumpInputRef.current?.focus();
    } else {
      firstInputRef.current?.focus();
    }
  }, []);

  const {
    data: courseData,
  } = useFetchAllCourses();

  const { data: sourceData, isLoading, isError } = useFetchAllSource();

  const courseList = courseData?.course || [];
  const sourceList = sourceData?.source || [];

  const error = useSelector((state: RootState) => state.enquiry.error);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 2000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newEnquiry.name) {
      newErrors.name = "Name is required.";
    }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact no. is required.";
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value; // Extract the string from the event
    const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);
    const formattedNumber = digitsOnly;

    setNewEnquiry((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));

    setField("contact", formattedNumber);

    if (phoneNumber.length === 10) {
      setErrors((prev) => ({ ...prev, contact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        contact: "Phone number must be 10 digits",
      }));
    }
  };

  const handleAlternatePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value; // Extract the string from the event
    const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);
    const formattedNumber = digitsOnly;

    setNewEnquiry((prev) => ({
      ...prev,
      alternateContact: formattedNumber,
    }));

    setField("alternateContact", formattedNumber);

    if (phoneNumber.length === 10) {
      setErrors((prev) => ({ ...prev, alternateContact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        alternateContact: "Phone number must be 10 digits",
      }));
    }
  };

  const handleChange = (field: keyof EnquiryData, value: string | string[]) => {
    setNewEnquiry((prev) => ({
      ...prev,
      [field]: value,
    }));

    setField(field, value);

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

  const handleDateChange = (field: keyof EnquiryData, value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    let formattedValue = digits;
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    } else if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
    }

    setNewEnquiry((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    setField(field as string, formattedValue);

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
      });

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 2000);

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

    createEnquiry(normalizedEnquiry, {
      onSuccess: () => {
        setNewEnquiry({ name: "", email: "", courseId: [], source: "", enquiryDate: "", alternateContact: "", location: "", city: "", gender: "", dob: "", referedBy: "", takenBy: "", contact: "" });

        window.scrollTo({
          top: 0, behavior: "smooth"
        });

        setAlert({
          show: true,
          title: "Enquiry Created",
          message: "Enquiry has been Successfully Created.",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          router.replace("/dashboard/enquiry");
        }, 300);
      },

      onError: () => {
        window.scrollTo({
          top: 0, behavior: "smooth"
        });
      },
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Enquiry" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">Enquiry Information</h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to log a new system enquiry.</p>
          </div>

          {error && <Alert variant={"error"} title={""} message={error} showLink={false} />}
          {alert.show && <Alert variant={alert.title === "Enquiry Created" ? "success" : "error"} title={alert.title} message={alert.message} showLink={false} />}

          {/* Section 1: Personal Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Personal Details</h3>
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
                    options={genders.map((item) => ({ label: item.label, value: item.value }))}
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
                  type="text"
                  tabIndex={3}
                  placeholder="DD-MM-YYYY"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  value={newEnquiry.dob}
                  onChange={(e) => handleDateChange("dob", e.target.value)}
                />
                {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Contact & Location</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div ref={(el) => { inputRefs.current.contact = el; }}>
                <Label>Contact No. *</Label>
                <div className="relative">
                  <PhoneNumberInput
                    tabIndex={4}
                    placeholder="Enter Contact"
                    value={newEnquiry.contact}
                    onChange={handlePhoneNumberChange}
                  />
                  {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
                  <span className="absolute top-5.5 left-0 -translate-y-1/2 border-r border-gray-200 px-3 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    IN
                  </span>
                </div>
              </div>

              <div>
                <Label>Alternate Contact No.</Label>
                <div className="relative">
                  <PhoneNumberInput
                    tabIndex={5}
                    placeholder="Enter Alternate"
                    value={newEnquiry.alternateContact}
                    onChange={handleAlternatePhoneNumberChange}
                  />
                  {errors.alternateContact && <p className="mt-1 text-sm text-red-500">{errors.alternateContact}</p>}
                  <span className="absolute top-5.5 left-0 -translate-y-1/2 border-r border-gray-200 px-3 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    IN
                  </span>
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter Email"
                    type="text"
                    className="pl-[55px]"
                    tabIndex={6}
                    value={normalizeEmail(newEnquiry.email)}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <EnvelopeIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label>City</Label>
                <Select
                  options={city.map((c) => ({ label: c.name, value: c.name }))}
                  tabIndex={7}
                  placeholder="Select City"
                  onChange={(value) => handleChange("city", value)}
                  value={newEnquiry.city}
                />
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
              </div>

              <div className="lg:col-span-2">
                <Label>Locality</Label>
                <Input
                  type="text"
                  placeholder="Enter Locality"
                  value={normalizeToLowercase(newEnquiry.location)}
                  tabIndex={8}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Enquiry Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-slate-950">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Enquiry Details</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              <div className="lg:col-span-2" ref={(el) => { inputRefs.current.courseId = el; }}>
                <div className="relative" data-master="course">
                  <MultiSelect
                    ref={jumpInputRef}
                    tabIndex={9}
                    tooltip={true}
                    content="Create Course if not in list."
                    label="Select Courses *"
                    options={courseList.map((course) => ({
                      value: String(course.id),
                      text: course.name,
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
                  type="text"
                  tabIndex={10}
                  placeholder="DD-MM-YYYY"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  value={newEnquiry.enquiryDate}
                  onChange={(e) => handleDateChange("enquiryDate", e.target.value)}
                />
                {errors.enquiryDate && <p className="mt-1 text-sm text-red-500">{errors.enquiryDate}</p>}
              </div>

              <div>
                <Label>Source</Label>
                <div className="relative">
                  <Select
                    tabIndex={11}
                    options={sourceList.map((item) => ({ label: item.name, value: item.slug }))}
                    placeholder="Select Source"
                    onChange={(value) => handleChange("source", value)}
                    value={newEnquiry.source}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.source && <p className="mt-1 text-sm text-red-500">{errors.source}</p>}
              </div>

              <div>
                <Label>Referred By</Label>
                <Input
                  type="text"
                  placeholder="Enter Reference"
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
                  placeholder="Taken By"
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
              tabIndex={14}
              variant="primary"
              className="min-w-[120px] rounded bg-gray-900 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
              onClick={handleSubmit}
            >
              Save Enquiry
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}