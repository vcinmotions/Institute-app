"use client";
import React, { useState, useEffect, useRef } from 'react';
import Label from '../Label';
import Input from '../input/InputField';
import Select from '../Select';
import { ChevronDownIcon } from '../../../icons';
import ModalCard from '@/components/common/ModalCard';
import Button from '@/components/ui/button/Button';
import { useCreateEnquiry } from "@/hooks/useCreateEnquiry";
import Alert from '@/components/ui/alert/Alert';
import { EnvelopeIcon } from '@/icons';
import PhoneInput from '../group-input/PhoneInput';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { setCourses } from '@/store/slices/courseSlice';
import { useFetchCourse } from '@/hooks/useQueryFetchCourseData';
import { toast } from 'sonner';
import { setError } from '@/store/slices/enquirySlice';
import {Calendar} from "@heroui/react";
import {today, getLocalTimeZone} from "@internationalized/date";

interface DefaultInputsProps {
  onCloseModal: () => void;
  courses: any[];
}

interface EnquiryData {
  name: string;
  email: string;
  course: string;
  alternateContact: string,
  age: number | null,
  location: string,
  gender: string,
  dob: string,
  referedBy: string,
  source: string;
  contact: string;
}

export default function EnquiryForm({ onCloseModal, courses }: DefaultInputsProps) {
  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    name: "",
    email: "",
    course: "",
    alternateContact: "",
    age: null,
    location: "",
    gender: "",
    dob: "",
    referedBy: "",
    source: "",
    contact: "",
  });

  const dispatch = useDispatch();

  //const course = useSelector((state: RootState) => state.course.courses);

    // New state for alert
  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; variant: string }>({
    show: false,
    title: '',
    message: '',
    variant: '',
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
  const firstInputRef = useRef<HTMLInputElement>(null);
    
      useEffect(() => {
        firstInputRef.current?.focus();
      }, []);

  console.log("Get Courses Name in Enquiry Form:", courses);

   const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

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

  console.log("Get Courses Name in Enquiry Form:", courseList);

  const error = useSelector((state: RootState) => state.enquiry.error);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(setError(null));  // ✅ Clear error after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

 const handlePhoneNumberChange = (phoneNumber: string, countryCode = "+91") => {
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

 const handleAlternatePhoneNumberChange = (phoneNumber: string, countryCode = "+91") => {
  // If phoneNumber doesn't start with +, prepend selected country code
  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith("+")) {
    formattedNumber = countryCode + phoneNumber.replace(/^0+/, ""); // remove leading zeros
  }

  setNewEnquiry((prev) => ({
    ...prev,
    alternateContact: formattedNumber,
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

    if (!newEnquiry.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email)) {
      newErrors.email = "Email is invalid.";
    }

    if (!newEnquiry.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    } else if (!/^\+\d{10,15}$/.test(newEnquiry.contact)) {
      newErrors.contact = "Contact must be 10 digits.";
    }

    if (!newEnquiry.course.trim()) {
      newErrors.course = "Course is required.";
    }

    if (!newEnquiry.source.trim()) {
      newErrors.source = "Source is required.";
    }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof EnquiryData, value: string | number | null) => {
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

  createEnquiry(newEnquiry, {
    onSuccess: () => {
      setNewEnquiry({ name: "", email: "", course: "", source: "", alternateContact: "", age: null, location: "", gender: "", dob: "", referedBy: "", contact: "" });

      setAlert({
        show: true,
        title: "Enquiry Created",
        message: "Enquiry has been Successfully Created.",
        variant: "success",
      });

      setTimeout(() => {
        onCloseModal();
      }, 3000);
    },

    onError: () => {
      // You already handle error via redux + toast
    },
  });
};

  console.log("GET ENQUIRY FORM DATA", newEnquiry);

  return (
    <ModalCard title="Create Enquiry" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm border border-red-300">
            {error}
          </div>
        )}
        {alert.show && 
        (<Alert
            variant={alert.title === "Enquiry Created" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />)}
        <div>
          <Label>Name *</Label>
          <Input
          ref={firstInputRef}
            type="text"
            placeholder="Info Demo"
            value={newEnquiry.name}
            tabIndex={1}
            onChange={(e) => handleChange("name", e.target.value)}         />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
              onChange={(e) => handleChange("email", e.target.value)}          />
             {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Conatct No. *</Label>
          <PhoneInput
           tabIndex={3}
            selectPosition="start"
            countries={countries}
            placeholder="+91 55555 00000"
            
            onChange={handlePhoneNumberChange}
          />
           {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
        </div>{" "}

       <div>
          <Label>Alternate Conatct No.</Label>
          <PhoneInput
           tabIndex={3}
            selectPosition="start"
            countries={countries}
            placeholder="+91 55555 00000"
            
            onChange={handleAlternatePhoneNumberChange}
          />
           {errors.alternateContact && <p className="text-red-500 text-sm">{errors.alternateContact}</p>}
        </div>{" "}

        <div>
          <Label>Age</Label>
          <Input
            type="number"
            placeholder="Enter Age"
            value={newEnquiry.age as number}
            tabIndex={1}
            onChange={(e) => handleChange("age", e.target.value)}         />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
        </div>

        <div className="relative">
            <Select
              tabIndex={8}
              options={genders.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              placeholder="Select Gender"
              onChange={(value) => handleChange("gender", value)}
              defaultValue={newEnquiry.gender} // just the courseId string
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>

        <div>
          <Label>Location</Label>
          <Input
            type="text"
            placeholder="Enter Age"
            value={newEnquiry.location}
            tabIndex={1}
            onChange={(e) => handleChange("location", e.target.value)}         />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        <div>
          <Label>DoB</Label>
          <Input
            type="text"
            placeholder="Enter Age"
            value={newEnquiry.dob}
            tabIndex={1}
            onChange={(e) => handleChange("dob", e.target.value)}         />
            {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
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
          <Label>Select Course</Label>
          <div className="relative">
            <Select
              options={courseList.map((course) => ({
                label: course.name,
                value: course.name,
              }))}
              placeholder="Select a course"
              onChange={(value) => handleChange("course", value)}
              defaultValue={newEnquiry.course} // Bind selected course
              className="dark:bg-dark-900"
              tabIndex={4}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
        </div>

        <div>
          <Label>Refered By</Label>
          <Input
            type="text"
            placeholder="Enter Age"
            value={newEnquiry.referedBy}
            tabIndex={1}
            onChange={(e) => handleChange("referedBy", e.target.value)}         />
            {errors.referedBy && <p className="text-red-500 text-sm">{errors.referedBy}</p>}
        </div>

        <div>
          <Label>Select Source</Label>
          <div className="relative">
            <Select
              options={options}
              placeholder="Select an option"
              onChange={(value) => handleChange("source", value)}
              className="dark:bg-dark-900"
              tabIndex={5}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" tabIndex={6} onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" tabIndex={7} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
