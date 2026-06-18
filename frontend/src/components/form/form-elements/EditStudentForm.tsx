"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { RootState } from "@/store";

// Components
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Select from "@/components/form/Select";
import ModalCard from "@/components/common/ModalCard";
import ChangeLogModal from "@/components/common/ChangeLogModal";

// Icons & Hooks
import { ChevronDownIcon, EnvelopeIcon } from "@/icons";
import { useEditStudent } from "@/hooks/useEditStudent";
import { useFetchEnquiryById } from "@/hooks/queries/useQueryFetchEnquiry";
import { setBatches } from "@/store/slices/batchSlice";
import { getBatch } from "@/lib/api";
import { useScrollToError } from "@/app/utils/ScrollToError";

interface DefaultInputsProps {
  onCloseModal: () => void;
  student: any;
}

interface EnquiryData {
  id: string;
  name: string;
  email: string;
  contact: string;
}

interface NewEnquiryData {
  idProofType: string;
  idProofNumber: string;
  address: string;
  admissionDate: any;
  gender: string;
  dob: string;
  facultyId: string;
  residentialAddress: string;
  permenantAddress: string;
  parentsContact: string;
  fatherName: string;
  qualification: string;
  religion: string;
}

export default function EditStudentForm({ onCloseModal, student }: DefaultInputsProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id: enquiryId } = useParams();

  // State Management
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });

  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    id: "",
    name: "",
    email: "",
    contact: "",
  });

  const [filledEnquiryData, setFilledEnquiryData] = useState<NewEnquiryData>({
    idProofType: "",
    idProofNumber: "",
    address: "",
    admissionDate: "",
    gender: "",
    residentialAddress: "",
    permenantAddress: "",
    parentsContact: "",
    fatherName: "",
    qualification: "",
    dob: "",
    religion: "",
    facultyId: "",
  });

  // Refs & Custom Hooks
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { inputRefs, scrollToError } = useScrollToError();
  const { mutate: editStudent } = useEditStudent();

  // Constants
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const options = [
    { value: "aadhar card", label: "Aadhar Card" },
    { value: "pan card", label: "PAN Card" },
    { value: "other", label: "Other" },
  ];

  const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  // Lifecycle & Fetching
  useEffect(() => {
    firstInputRef.current?.focus();

    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const responseBatch = await getBatch({ token });
        dispatch(setBatches(responseBatch.batch));
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (!student) return;

    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split("T")[0];
    };

    setNewEnquiry({
      id: String(student.id ?? ""),
      name: student.fullName ?? "",
      email: student.email ?? "",
      contact: student.contact ?? "",
    });

    setFilledEnquiryData({
      idProofType: student.idProofType ?? "",
      idProofNumber: student.idProofNumber ?? "",
      address: "",
      admissionDate: student.admissionDate ?? "",
      gender: student.gender ?? "",
      dob: formatDateForInput(student.dob),
      residentialAddress: student.residentialAddress ?? "",
      permenantAddress: student.permenantAddress ?? "",
      parentsContact: student.parentsContact ?? "",
      fatherName: student.fatherName ?? "",
      qualification: student.qualification ?? "",
      religion: student.religion ?? "",
      facultyId: "",
    });
  }, [student]);

  // Handlers
  const handleBasicChange = (field: keyof EnquiryData, value: string) => {
    setNewEnquiry((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleExtendedChange = (field: keyof NewEnquiryData, value: string) => {
    setFilledEnquiryData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhoneNumberChange = (
    phoneNumber: string,
    field: "contact" | "parentsContact",
    countryCode: string
  ) => {
    let digitsOnly = phoneNumber.replace(/\D/g, "");
    const countryDigits = countryCode.replace("+", "");

    if (digitsOnly.startsWith(countryDigits)) {
      digitsOnly = digitsOnly.slice(countryDigits.length);
    }
    digitsOnly = digitsOnly.slice(0, 10);
    const formattedNumber = digitsOnly.length > 0 ? `${countryCode}${digitsOnly}` : "";

    if (field === "contact") {
      setNewEnquiry((prev) => ({ ...prev, contact: formattedNumber }));
    } else {
      setFilledEnquiryData((prev) => ({ ...prev, parentsContact: formattedNumber }));
    }

    setErrors((prev) => ({
      ...prev,
      [field]: digitsOnly.length === 0 || digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newEnquiry.name.trim()) newErrors.name = "Student name is required.";
    if (!newEnquiry.contact.trim()) newErrors.contact = "Contact number is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 3000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please ensure required fields are filled correctly.",
        variant: "error",
      });

      scrollToError(validationErrors);

      setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), 3000);
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
      setTimeout(() => setAlert({ show: false, title: "", message: "", variant: "" }), 3000);
      return;
    }

    const editStudentPayload = {
      token,
      id: newEnquiry.id,
      name: newEnquiry.name,
      email: newEnquiry.email,
      contact: newEnquiry.contact,
      idProofType: filledEnquiryData.idProofType,
      idProofNumber: filledEnquiryData.idProofNumber,
      address: filledEnquiryData.address,
      gender: filledEnquiryData.gender,
      residentialAddress: filledEnquiryData.residentialAddress,
      permenantAddress: filledEnquiryData.permenantAddress,
      parentsContact: filledEnquiryData.parentsContact,
      fatherName: filledEnquiryData.fatherName,
      qualification: filledEnquiryData.qualification,
      dob: filledEnquiryData.dob,
      religion: filledEnquiryData.religion,
    };

    setPendingPayload(editStudentPayload);
    setShowChangeLog(true);
  };

  const handleConfirmUpdate = async (reason: string) => {
    if (!pendingPayload) return;
    try {
      await editStudent({ ...pendingPayload, changeReason: reason });
      setShowChangeLog(false);
      setAlert({
        show: true,
        title: "Success",
        message: "Student details updated successfully.",
        variant: "success",
      });
      setTimeout(() => onCloseModal(), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ModalCard title="Edit Student Details" oncloseModal={onCloseModal} onBodyRef={(el) => (modalBodyRef.current = el)}>
      <div className="flex flex-col gap-6">

        {/* Alert Messages */}
        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Form Groupings: Personal Details */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div data-master="name">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                ref={firstInputRef}
                tabIndex={1}
                placeholder="e.g. John Doe"
                value={newEnquiry.name}
                onChange={(e) => handleBasicChange("name", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div data-master="email">
              <Label>Email</Label>
              <div className="relative">
                <Input
                  tabIndex={2}
                  placeholder="info@gmail.com"
                  type="email"
                  className="w-full rounded border border-gray-300 bg-white pl-[45px] pr-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  value={newEnquiry.email}
                  onChange={(e) => handleBasicChange("email", e.target.value)}
                />
                <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3 py-3 text-gray-500 dark:border-gray-800">
                  <EnvelopeIcon />
                </span>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div data-master="contact">
              <Label>Student Contact <span className="text-red-500">*</span></Label>
              <PhoneInput
                tabIndex={3}
                selectPosition="start"
                countries={countries}
                placeholder="+91 00000 00000"
                value={newEnquiry.contact}
                onChange={(value, country) => handlePhoneNumberChange(value, "contact", country)}
              />
              {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
            </div>

            <div data-master="parentsContact">
              <Label>Alternate Contact (Parents)</Label>
              <PhoneInput
                tabIndex={4}
                selectPosition="start"
                countries={countries}
                placeholder="+91 55555 00000"
                value={filledEnquiryData.parentsContact}
                onChange={(value, country) => handlePhoneNumberChange(value, "parentsContact", country)}
              />
              {errors.parentsContact && <p className="mt-1 text-sm text-red-500">{errors.parentsContact}</p>}
            </div>

            <div data-master="fatherName">
              <Label>Father's Name</Label>
              <Input
                type="text"
                tabIndex={5}
                placeholder="e.g. Robert Doe"
                value={filledEnquiryData.fatherName}
                onChange={(e) => handleExtendedChange("fatherName", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div data-master="dob">
              <Label>Date Of Birth</Label>
              <Input
                tabIndex={6}
                type="date"
                value={filledEnquiryData.dob}
                onChange={(e) => handleExtendedChange("dob", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
            </div>

            <div data-master="gender">
              <Label>Gender</Label>
              <div className="relative">
                <Select
                  tabIndex={7}
                  options={genders}
                  placeholder="Select Gender"
                  onChange={(value) => handleExtendedChange("gender", value)}
                  value={filledEnquiryData.gender}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div data-master="qualification">
              <Label>Qualification</Label>
              <Input
                type="text"
                tabIndex={8}
                placeholder="e.g. B.Tech"
                value={filledEnquiryData.qualification}
                onChange={(e) => handleExtendedChange("qualification", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Form Groupings: Verification & Address */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Verification & Address
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div data-master="idProofType">
              <Label>Select ID Proof</Label>
              <div className="relative">
                <Select
                  tabIndex={9}
                  options={options}
                  placeholder="Select an option"
                  value={filledEnquiryData.idProofType}
                  onChange={(value) => handleExtendedChange("idProofType", value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div data-master="idProofNumber">
              <Label>
                <span className="capitalize">
                  {filledEnquiryData.idProofType ? filledEnquiryData.idProofType : "ID"}
                </span>{" "}
                Number
              </Label>
              <Input
                tabIndex={10}
                type="text"
                placeholder="Enter ID Number"
                onChange={(e) => handleExtendedChange("idProofNumber", e.target.value)}
                value={filledEnquiryData.idProofNumber}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div data-master="residentialAddress">
              <Label>Residential Address</Label>
              <Input
                tabIndex={11}
                type="text"
                placeholder="e.g. Mumbai, Maharashtra"
                value={filledEnquiryData.residentialAddress}
                onChange={(e) => handleExtendedChange("residentialAddress", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div data-master="permenantAddress">
              <Label>Permanent Address</Label>
              <Input
                tabIndex={12}
                type="text"
                placeholder="e.g. Pune, Maharashtra"
                value={filledEnquiryData.permenantAddress}
                onChange={(e) => handleExtendedChange("permenantAddress", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            tabIndex={13}
            onClick={onCloseModal}
            className="min-w-[100px] rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            Close
          </Button>
          <Button
            size="sm"
            variant="primary"
            tabIndex={14}
            onClick={handleSubmit}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Save Changes
          </Button>
        </div>

        {/* ChangeLog Modal Triggered by Action Bar Submit */}
        <ChangeLogModal
          isOpen={showChangeLog}
          onClose={() => setShowChangeLog(false)}
          onConfirm={handleConfirmUpdate}
        />

      </div>
    </ModalCard>
  );
}