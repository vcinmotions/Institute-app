"use client";
import React, { useEffect, useRef, useState } from 'react';
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
import { useCreateCourse } from '@/hooks/useCreateCourseData';

interface DefaultInputsProps {
  onCloseModal: () => void;
  batch: any[];
}

interface CourseData {
  description: string;
  durationWeeks: string;
  name: string; // ✅ this matches backend
  paymentType: string;
  totalAmount: string;
  installmentCount: "";
}

export default function CourseForm({ onCloseModal }: DefaultInputsProps) {
  const [newCourse, setNewCourse] = useState<CourseData>({
    name: "",
    description: "",
    durationWeeks: "",
    paymentType: "",
    totalAmount: "",
    installmentCount: "",
  });

    // New state for alert
  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; variant: string }>({
    show: false,
    title: '',
    message: '',
    variant: '',
  });

  const [errors, setErrors] = useState<Partial<CourseData>>({});
  const { mutate: createCourse } = useCreateCourse();
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

  const handlePhoneNumberChange = (phoneNumber: string) => {
  setNewCourse((prev) => ({
    ...prev,
    contact: phoneNumber,
  }));

  // Clear error if any
  setErrors((prev) => ({
    ...prev,
    contact: "",
  }));
};

  const paymentType = [
    { value: "ONE_TIME", label: "One Time" },
    { value: "INSTALLMENT", label: "Installment" },
  ];

  const validate = () => {
    const newErrors: Partial<CourseData> = {};

    if (!newCourse.description.trim()) {
      newErrors.description = "Name is required.";
    }

    if (!newCourse.durationWeeks.trim()) {
      newErrors.durationWeeks = "Name is required.";
    }

    if (!newCourse.name.trim()) {
      newErrors.name = "Course is required.";
    }

    if (!newCourse.totalAmount.trim()) {
      newErrors.totalAmount = "totalAmount is required.";
    }

    if (!newCourse.paymentType.trim()) {
      newErrors.paymentType = "paymentType is required.";
    }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = (field: keyof CourseData, value: string) => {
  //   setNewCourse((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  //   // Clear error on change
  //   setErrors((prev) => ({
  //     ...prev,
  //     [field]: "",
  //   }));
  // };

  const handleChange = (field: keyof CourseData, value: string) => {
    setNewCourse((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "paymentType" && value === "ONE_TIME" ? { installmentCount: "" } : {}),
    }));

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = async () => {
    console.log("Submitting enquiry data:", newCourse);

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

    createCourse(newCourse, {
    onSuccess: () => {
       setNewCourse({ description: "", durationWeeks: "", name: "", paymentType: "", totalAmount: "", installmentCount: ""});

      setAlert({
          show: true,
          title: "Enquiry Created",
          message: "Your enquiry has been successfully submitted.",
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

  return (
    <ModalCard title="Create New Course" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && 
        (<Alert
            variant={alert.title === "Enquiry Created" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />)}

        <div>
          <Label>Course</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={newCourse.name}
            onChange={(e) => handleChange("name", e.target.value)}        />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>


        

        <div>
          <Label>Duration Weeks</Label>
          <Input
            type="text"
            tabIndex={2}
            placeholder="12"
            value={newCourse.durationWeeks}
            onChange={(e) => handleChange("durationWeeks", e.target.value)}         />
          {errors.durationWeeks && <p className="text-red-500 text-sm">{errors.durationWeeks}</p>}
        </div>

        
        <div>
          <Label>Description</Label>
          <Input
            type="text"
            tabIndex={3}
            placeholder="Course..."
            value={newCourse.description}
            onChange={(e) => handleChange("description", e.target.value)}         />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        

        <div>
          <Label>Course Amount</Label>
          <Input
            type="text"
            tabIndex={4}
            placeholder="12000"
            value={newCourse.totalAmount}
            onChange={(e) => handleChange("totalAmount", e.target.value)}         />
          {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount}</p>}
        </div>

        <div>
          <Label>Select Payment Type</Label>
          <div className="relative">
            <Select
              options={paymentType}
              placeholder="Select an option"
              onChange={(value) => handleChange("paymentType", value)}
              className="dark:bg-dark-900"
              tabIndex={5}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>  
          {errors.paymentType && <p className="text-red-500 text-sm">{errors.paymentType}</p>}
        </div>

        <div>
          <Label>Installment Count</Label>
          <Input
            type="text"
            placeholder="3"
            tabIndex={6}
            disabled={newCourse.paymentType !== "INSTALLMENT"}
            value={newCourse.installmentCount}
            onChange={(e) => handleChange("installmentCount", e.target.value)}
          />
          {errors.installmentCount && (
            <p className="text-red-500 text-sm">{errors.installmentCount}</p>
          )}
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" tabIndex={7} onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" tabIndex={8} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
