"use client";
import React, { useState } from 'react';
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

interface DefaultInputsProps {
  onCloseModal: () => void;
}

interface EnquiryData {
  name: string;
  email: string;
  course: string;
  source: string;
  contact: string;
}

export default function MasterForm({ onCloseModal }: DefaultInputsProps) {
  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    name: "",
    email: "",
    course: "",
    source: "",
    contact: "",
  });

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

  const handlePhoneNumberChange = (phoneNumber: string) => {
  setNewEnquiry((prev) => ({
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
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof EnquiryData, value: string) => {
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

  const handleSubmit = async () => {
    console.log("Submitting enquiry data:", newEnquiry);

    if (!validate()) {
      console.warn("Validation failed:", errors);
      return;
    }

    try {
      await createEnquiry(newEnquiry);
      // alert("Enquiry created successfully!");
      setNewEnquiry({ name: "", email: "", course: "", source: "", contact: "" });
      setErrors({});
      
      // Wait 3 seconds before showing alert
        setAlert({
          show: true,
          title: "Enquiry Created",
          message: "Your enquiry has been successfully submitted.",
          variant: "success",
        });
      
      // Close modal after showing alert for 2 seconds (for example)
        setTimeout(() => {
          onCloseModal();
        }, 3000);

    } catch (error) {
      //alert("Failed to create enquiry.");
    }
  };

  return (
    <ModalCard title="Default Inputs" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && 
        (<Alert
            variant={alert.title === "Enquiry Created" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />)}
        <div>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Info Demo"
            value={newEnquiry.name}
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
              value={newEnquiry.email}
              onChange={(e) => handleChange("email", e.target.value)}          />
             {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder="+1 (555) 000-0000"
            onChange={handlePhoneNumberChange}
          />
           {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
        </div>{" "}

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

        <div>
          <Label>Course</Label>
          <Input
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={newEnquiry.course}
            onChange={(e) => handleChange("course", e.target.value)}        />
          {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
        </div>

        <div>
          <Label>Select Source</Label>
          <div className="relative">
            <Select
              options={options}
              placeholder="Select an option"
              onChange={(value) => handleChange("source", value)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
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
