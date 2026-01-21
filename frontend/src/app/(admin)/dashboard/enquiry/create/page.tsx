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
import { capitalizeWords } from "@/components/common/ToCapitalize";
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

type FormErrors = Partial<Record<keyof EnquiryData, string>>;

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

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!newEnquiry.name.trim()) {
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

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    // const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);
    const formattedNumber = code + phoneNumber;

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

  const handleAlternatePhoneNumberChange = (phoneNumber: string, code: string) => {
    // Extract digits only
    const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);

    const formattedNumber = code + digitsOnly;

    // Update input value (NO +91 here)
    setNewEnquiry((prev) => ({
      ...prev,
      alternateContact: formattedNumber,
    }));

    setField("alternateContact", formattedNumber); // <-- IMPORTANT

    // Validation
    if (digitsOnly.length === 10) {
      setErrors((prev) => ({ ...prev, alternateContact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        alternateContact: "Phone number must be 10 digits",
      }));
    }
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
 
    setNewEnquiry({ name: "", email: "", courseId: [], source: "", alternateContact: "", location: "", city: "", gender: "", dob: "", referedBy: "", contact: "" });

    firstInputRef.current?.focus();
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
    // if (!validate()) {
    //   setAlert({
    //     show: true,
    //     title: "Validation Error",
    //     message: "Please enter required inputs.",
    //     variant: "error",
    //   });

    //    window.scrollTo({
    //       top: 0, behavior: "smooth"
    //     })

    //   setTimeout(() => {
    //     setAlert({ show: false, title: "", message: "", variant: "" });
    //   }, 2000);

    //   return;
    // }

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

        // setTimeout(() => {
        //   router.back();
        // }, 300);

        setTimeout(() => {
          router.replace("/dashboard/enquiry");
        }, 300);

      },

      onError: () => {
        // You already handle error via redux + toast
        window.scrollTo({
          top: 0, behavior: "smooth"
        })
      },
    });
  };

  console.log("GET ENQUIRY FORM DATA", newEnquiry);
  console.log("GET ENQUIRY FORM DATA IN STORE", form);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Enquiry" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">

        <div className="space-y-8">
          <h2 className="border-b pb-6 dark:text-gray-50 dark:border-gray-700">Enquiry Infomation</h2>
          {error && (
            <Alert
              variant={"error"}
              title={""}
              message={error}
              showLink={false}
            />
          )}
          {alert.show && (
            <Alert
              variant={alert.title === "Enquiry Created" ? "success" : "error"}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}
          <div
          ref={(el) => {
                inputRefs.current.name = el;
              }}
          >
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
          <div
            ref={(el) => {
              inputRefs.current.contact = el;
            }}
          >
          <Label>Contact No. *</Label>
          <div className="relative">
            <PhoneInput
              selectPosition="start"
              countries={countries}
              tabIndex={3}
              placeholder="Enter Contact"
              onChange={handlePhoneNumberChange}
            />
            {errors.contact && (
              <p className="text-sm text-red-500">{errors.contact}</p>
            )}
          </div>
        </div>{" "}     

          <div>
          <Label>Alternate Conatct No.</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            tabIndex={4}
            placeholder="Enter Alternate Conatact"
            onChange={handleAlternatePhoneNumberChange}
          />
           {errors.alternateContact && <p className="text-red-500 text-sm">{errors.alternateContact}</p>}
        </div>{" "}

         <div ref={(el) => {
                inputRefs.current.courseId = el;
              }}>
            <div className="relative" data-master="course">
              <MultiSelect
                ref={jumpInputRef}
                tabIndex={5}
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
          <Label>Date Of Birth</Label>
          <Input
            tabIndex={6}
            type="date"
            placeholder="30-02-2002"
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
            <Label>City </Label>
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
          <Label>Locality</Label>
          <Input
            type="text"
            placeholder="Enter Locality"
            className="capitalize"
            value={newEnquiry.location}
            tabIndex={9}
            onChange={(e) => handleChange("location", e.target.value)}         />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>
         
        <div>
          <Label>Source </Label>
          <div className="relative">
            <Input
              placeholder="Enter Source"
              onChange={(e) => handleChange("source", e.target.value)}
              className="dark:bg-dark-900 capitalize"
              value={newEnquiry.source} // Bind selected course
              tabIndex={10}
            />
          </div>
          {errors.source && (
            <p className="text-sm text-red-500">{errors.source}</p>
          )}
        </div>

         <div>
          <Label>Referred By</Label>
          <Input
            type="text"
            className="capitalize"
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
            <Button size="sm" tabIndex={13} variant="primary" className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function scrollToError(validationErrors: any) {
  throw new Error("Function not implemented.");
}

