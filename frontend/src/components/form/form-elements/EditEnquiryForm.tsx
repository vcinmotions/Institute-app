"use client";
import React, { useState, useEffect, useRef } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { EnvelopeIcon } from "@/icons";
import PhoneInput from "../group-input/PhoneInput";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useFetchAllCourses, Course } from "@/hooks/queries/useQueryFetchCourseData";
import { useEditEnquiry } from "@/hooks/useEditEnquiry";
import { toast } from "sonner";
import { setError } from "@/store/slices/enquirySlice";
import MultiSelect from "../MultiSelect";

import { City, State, IState, ICity } from "country-state-city";
import { capitalizeWords } from "@/components/common/ToCapitalize";
import { normalizeEmail, normalizePhone, normalizeToLowercase, titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { useFetchSource } from "@/hooks/queries/useQueryFetchSource";

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
  enquiryData,
}: Omit<DefaultInputsProps, "courses">) {
  const dispatch = useDispatch();
  const modalBodyRef = useRef<HTMLDivElement>(null);

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

  // ✅ FIXED: Constrained the literal type of variant to match Alert component props safely
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "warning" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    variant: "info", // Set a valid initial union placeholder literal
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<IState[]>([]);
  const [city, setCity] = useState<ICity[]>([]);

  const error = useSelector((state: RootState) => state.enquiry.error);
  const branchState = useSelector((state: RootState) => state.auth.statelocation);
  const branchCountry = useSelector((state: RootState) => state.auth.country);

  const { inputRefs, scrollToError } = useScrollToError();
  const { mutate: editEnquiry, isPending } = useEditEnquiry();

  const { data: courseData, isLoading: courseLoading } = useFetchAllCourses();

  const { data: sourceData, isLoading, isError } = useFetchSource();

  const courseList = courseData?.course || [];
  const sourceList = sourceData?.source || [];

  useEffect(() => {
    if (branchCountry && branchState) {
      setState(State.getStatesOfCountry(branchCountry));
      setCity(City.getCitiesOfState(branchCountry, branchState));
    }
  }, [branchCountry, branchState]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    const timer = setTimeout(() => {
      dispatch(setError(null));
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  useEffect(() => {
    if (!enquiryData) return;

    const courseIds = enquiryData.enquiryCourse
      ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
      : [];

    const splicedContact = enquiryData.contact ? enquiryData.contact.slice(-10) : "";
    const splicedAlternateContact = enquiryData.alternateContact ? enquiryData.alternateContact.slice(-10) : "";

    // Extract slug cleanly whether "source" is an object or a fallback string
    const sourceSlug = enquiryData.source && typeof enquiryData.source === "object"
      ? enquiryData.source.slug
      : (enquiryData.source ?? "");

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
      source: sourceSlug, // 👈 Fixed: Form state now gets the string slug ("indeed")
      courseId: courseIds,
    });
  }, [enquiryData]);

  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    const safePhone = phoneNumber || "";
    let digitsOnly = safePhone.replace(/\D/g, "");
    const countryDigits = (code || "").replace("+", "");

    if (digitsOnly.startsWith(countryDigits)) {
      digitsOnly = digitsOnly.slice(countryDigits.length);
    }
    digitsOnly = digitsOnly.slice(0, 10);
    const formattedNumber = digitsOnly ? `${code}${digitsOnly}` : "";

    setNewEnquiry((prev) => ({ ...prev, contact: formattedNumber }));
    setErrors((prev) => ({
      ...prev,
      contact: digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
    }));
  };

  const handleAlternatePhoneNumberChange = (phoneNumber: string, code: string) => {
    let digitsOnly = phoneNumber.replace(/\D/g, "");
    const countryDigits = code.replace("+", "");

    if (digitsOnly.startsWith(countryDigits)) {
      digitsOnly = digitsOnly.slice(countryDigits.length);
    }
    digitsOnly = digitsOnly.slice(0, 10);
    const formattedNumber = digitsOnly ? `${code}${digitsOnly}` : "";

    setNewEnquiry((prev) => ({ ...prev, alternateContact: formattedNumber }));
    setErrors((prev) => ({
      ...prev,
      alternateContact: digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!newEnquiry.name.trim()) newErrors.name = "Name is required.";
    if (!newEnquiry.contact.trim()) newErrors.contact = "Contact number is required.";
    if (newEnquiry.courseId.length === 0) newErrors.courseId = "Select at least one course.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof EnquiryData, value: string | string[]) => {
    setNewEnquiry((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter required fields.",
        variant: "error", // ✅ Matches narrowed type parameter safely
      });
      scrollToError(validationErrors);
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 2000);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setAlert({
        show: true,
        title: "Unauthorized",
        message: "Token not found. Please log in again.",
        variant: "error", // ✅ Matches narrowed type parameter safely
      });
      modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
        setAlert({
          show: true,
          title: "Enquiry Updated",
          message: "Enquiry has been Successfully Updated.",
          variant: "success", // ✅ Matches narrowed type parameter safely
        });
        setTimeout(() => {
          onCloseModal();
        }, 500);
      },
      onError: () => {
        modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

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

  return (
    <ModalCard
      title="Edit Enquiry"
      oncloseModal={onCloseModal}
      onBodyRef={(el) => (modalBodyRef.current = el)}
    >
      <div className="flex flex-col gap-6">
        <div className="border-b pb-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the details below to modify the system enquiry.
          </p>
        </div>

        {error && <Alert variant="error" title="" message={error} showLink={false} />}
        {alert.show && <Alert variant={alert.variant} title={alert.title} message={alert.message} showLink={false} />}

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
                  options={genders}
                  placeholder="Select Gender"
                  onChange={(value) => handleChange("gender", value)}
                  value={newEnquiry.gender}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Date Of Birth</Label>
              <Input
                tabIndex={3}
                type="date"
                value={newEnquiry.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
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
                value={newEnquiry.alternateContact}
                placeholder="Enter alternate Contact"
                onChange={handleAlternatePhoneNumberChange}
              />
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
                <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3.5 text-gray-500">
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
            </div>

            <div className="lg:col-span-2">
              <Label>Location / Locality</Label>
              <Input
                type="text"
                placeholder="Enter Location"
                value={newEnquiry.location}
                tabIndex={8}
                onChange={(e) => handleChange("location", e.target.value)}
              />
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
              <div className="relative">
                <MultiSelect
                  tabIndex={9}
                  label="Select Courses *"
                  options={courseLoading ? [] : courseList?.map((course: Course) => ({
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
                value={newEnquiry.enquiryDate}
                onChange={(e) => handleChange("enquiryDate", e.target.value)}
              />
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
                value={newEnquiry.referedBy}
                tabIndex={12}
                onChange={(e) => handleChange("referedBy", e.target.value)}
              />
            </div>

            <div>
              <Label>Taken By</Label>
              <Input
                type="text"
                value={newEnquiry.takenBy}
                tabIndex={13}
                onChange={(e) => handleChange("takenBy", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button size="sm" variant="outline" tabIndex={14} onClick={onCloseModal}>
            Close
          </Button>
          <Button
            size="sm"
            tabIndex={15}
            disabled={isPending}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 dark:bg-brand-600"
            onClick={handleSubmit}
          >
            {isPending ? "Saving..." : "Save Enquiry"}
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}