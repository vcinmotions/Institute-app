"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronDownIcon, EnvelopeIcon } from "@/icons";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";
import { useDispatch, useSelector } from "react-redux";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { setCourses } from "@/store/slices/courseSlice";
import { RootState } from "@/store";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Select from "@/components/form/Select";
import DropzonBoxComponent from "@/components/form/form-elements/DropBox";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams } from "next/navigation";
import { useFetchEnquiryById } from "@/hooks/queries/useQueryFetchEnquiry";
import { setBatches } from "@/store/slices/batchSlice";
import { getBatch, getCourse } from "@/lib/api";
import MultiSelect from "@/components/form/MultiSelect";
import { Modal } from "@/components/ui/modal";
import ModalCard from "@/components/common/ModalCard";
import { useEditStudent } from "@/hooks/useEditStudent";
import ChangeLogModal from "@/components/common/ChangeLogModal";

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

interface NewEnquiryDataAll {
  name: string;
  email: string;
  contact: string;
  idProofType: string;
  idProofNumber: string;
  address: string;
  gender: string;
  dob: string;
  residentialAddress: string;
  permenantAddress: string;
  parentsContact: string;
  fatherName: string;
  qualification: string;
  religion: string;
}

export default function EditStudentForm({ onCloseModal, student }: DefaultInputsProps) {

  const courses = useSelector((state: RootState) => state.course.courses);
  const batch = useSelector((state: RootState) => state.batch.batches);
  console.log("get Courses data in admission form:", courses);
  console.log("get batch data in admission form:", batch);

  const [showChangeLog, setShowChangeLog] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

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

  console.log("Filled Data at Start of initialioze:", filledEnquiryData);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { id: enquiryId } = useParams();
  const { data, isLoading } = useFetchEnquiryById(enquiryId as string);
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);
  const dispatch = useDispatch();

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

  const scrollModalToTop = () => {
    modalBodyRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const inputRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [errors, setErrors] = useState<Partial<NewEnquiryDataAll>>({});
  const [paymentTypeOption, setpaymentTypeOption] = useState<any>([]);
  const [installmentTypeOption, setInstallmentTypeOption] = useState<any>([]);
  const { mutate: editStudent } = useEditStudent();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];


  console.log("GET ID BY PARAMS IN URL:", enquiryId);

  useEffect(() => {
    if (!student) return;

    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split("T")[0]; // ✅ KEY FIX
    };

    // Basic student info
    setNewEnquiry({
      id: String(student.id ?? ""),
      name: student.fullName ?? "",
      email: student.email ?? "",
      contact: student.contact ?? "",
    });

    // Extended details
    setFilledEnquiryData({
      idProofType: student.idProofType ?? "",
      idProofNumber: student.idProofNumber ?? "",
      address: "",
      admissionDate: student.admissionDate ?? "",

      gender: student.gender ?? "",
      dob: formatDateForInput(student.dob), // ✅ FIX HERE
      residentialAddress: student.residentialAddress ?? "",
      permenantAddress: student.permenantAddress ?? "",
      parentsContact: student.parentsContact ?? "",
      fatherName: student.fatherName ?? "",
      qualification: student.qualification ?? "",
      religion: student.religion ?? "",

      facultyId: "",
    });
  }, [student]);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token missing from sessionStorage");
        return;
      }
      try {
        const responseBatch = await getBatch({
          token,
        });

        dispatch(setBatches(responseBatch.batch));
      } catch (error) { }
    };

    fetchData();
  }, []);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);


  const options = [
    { value: "aadhar card", label: "Aadhar Card" },
    { value: "pan card", label: "Pan Card" },
    { value: "other", label: "Other" },
  ];

  const genders = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 🔹 Basic Enquiry Info
    if (!newEnquiry.name.trim()) newErrors.name = "Student name is required.";

    // if (!newEnquiry.email.trim()) newErrors.email = "Email is required.";
    // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email))
    //   newErrors.email = "Please enter a valid email address.";

    if (!newEnquiry.contact.trim())
      newErrors.contact = "Contact number is required.";
    // else if (!/^\+\d{10,15}$/.test(newEnquiry.contact))
    //   newErrors.contact = "Enter a valid phone number with country code.";

    // 🔹 Extended Admission Details
    // if (!filledEnquiryData.fatherName.trim())
    //   newErrors.fatherName = "Father's name is required.";

    // if (!filledEnquiryData.qualification.trim())
    //   newErrors.qualification = "Qualification is required.";

    // if (!filledEnquiryData.gender.trim())
    //   newErrors.gender = "Gender is required.";

    // if (!filledEnquiryData.dob.trim())
    //   newErrors.dob = "Date of birth is required.";
    // else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(filledEnquiryData.dob))
    //   newErrors.dob = "Date of birth must be in DD/MM/YYYY format.";

    // if (!filledEnquiryData.idProofType.trim())
    //   newErrors.idProofType = "Select an ID proof type.";
    // if (!filledEnquiryData.idProofNumber.trim())
    //   newErrors.idProofNumber = "ID proof number is required.";

    // if (!filledEnquiryData.residentialAddress.trim())
    //   newErrors.residentialAddress = "Residential address is required.";

    // if (!filledEnquiryData.permenantAddress.trim())
    //   newErrors.permenantAddress = "Permanent address is required.";

    // if (!filledEnquiryData.parentsContact.trim())
    //   newErrors.parentsContact = "Parent's contact number is required.";
    // else if (!/^\+\d{10,15}$/.test(filledEnquiryData.parentsContact))
    //   newErrors.parentsContact =
    //     "Enter a valid parent's phone number with country code.";

    // if (!filledEnquiryData.feeAmount.trim())
    //   newErrors.feeAmount = "Fee amount is required.";
    // else if (isNaN(Number(filledEnquiryData.feeAmount)))
    //   newErrors.feeAmount = "Fee amount must be a number.";

    // if (!filledEnquiryData.paymentType.trim())
    //   newErrors.paymentType =
    //     "Select a payment type (One-time or Installment).";

    // if (!filledEnquiryData.batchId) newErrors.batchId = "Batch is required.";
    // if (!filledEnquiryData.installmentTypeId)
    //   newErrors.installmentType = "Installment Type is required.";

    // Optional: validate ID proof type/number pattern
    // if (
    //   filledEnquiryData.idProofType === "aadhar card" &&
    //   !/^\d{12}$/.test(filledEnquiryData.idProofNumber)
    // )
    //   newErrors.idProofNumber = "Aadhar must be 12 digits.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 3000);

    return Object.keys(newErrors).length === 0;
  };

  const handleBasicChange = (
    field: keyof EnquiryData,
    value: string
  ) => {
    setNewEnquiry((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleExtendedChange = (
    field: keyof NewEnquiryData,
    value: string
  ) => {

    let formattedValue = value;

    // Try to parse the entered value as a Date
    const parsedDate = new Date(value);

    // If valid date, format to dd/MM/yyyy
    if (!isNaN(parsedDate.getTime())) {
      const day = String(parsedDate.getDate()).padStart(2, "0");
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const year = parsedDate.getFullYear();
      formattedValue = `${day}-${month}-${year}`;
    }

    setFilledEnquiryData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Optional: validate or reset error
    if (field === "dob") {
      if (isNaN(parsedDate.getTime())) {
        setErrors((prev) => ({ ...prev, dob: "Invalid date format" }));
      } else {
        setErrors((prev) => ({ ...prev, dob: "" }));
      }
    }

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // const handleChange = (field: keyof NewEnquiryData, value: string) => {
  //     let formattedValue = value;

  //     // Try to parse the entered value as a Date
  //     const parsedDate = new Date(value);

  //     // If valid date, format to dd/MM/yyyy
  //     if (!isNaN(parsedDate.getTime())) {
  //       const day = String(parsedDate.getDate()).padStart(2, "0");
  //       const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  //       const year = parsedDate.getFullYear();
  //       formattedValue = `${day}/${month}/${year}`;
  //     }

  //     setFilledEnquiryData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));

  //     // Clear error on change
  //     setErrors((prev) => ({
  //       ...prev,
  //       [field]: "",
  //     }));

  //     // Optional: validate or reset error
  //     if (field === "dob") {
  //       if (isNaN(parsedDate.getTime())) {
  //         setErrors((prev) => ({ ...prev, dob: "Invalid date format" }));
  //       } else {
  //         setErrors((prev) => ({ ...prev, dob: "" }));
  //       }
  //     }
  //   };

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

    const formattedNumber =
      digitsOnly.length > 0 ? `${countryCode}${digitsOnly}` : "";

    if (field === "contact") {
      setNewEnquiry((prev) => ({
        ...prev,
        contact: formattedNumber,
      }));
    }

    if (field === "parentsContact") {
      setFilledEnquiryData((prev) => ({
        ...prev,
        parentsContact: formattedNumber,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [field]:
        digitsOnly.length === 0 || digitsOnly.length === 10
          ? ""
          : "Phone number must be 10 digits",
    }));
  };


  // const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
  //   let digitsOnly = phoneNumber.replace(/\D/g, "");

  //   // Remove country code digits if already present
  //   const countryDigits = code.replace("+", "");
  //   if (digitsOnly.startsWith(countryDigits)) {
  //     digitsOnly = digitsOnly.slice(countryDigits.length);
  //   }

  //   digitsOnly = digitsOnly.slice(0, 10);

  //   const formattedNumber = digitsOnly
  //     ? `${code}${digitsOnly}`
  //     : "";

  //   setNewEnquiry((prev) => ({
  //     ...prev,
  //     contact: formattedNumber,
  //   }));

  //   setErrors((prev) => ({
  //     ...prev,
  //     contact:
  //       digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
  //   }));
  // };

  // const handleAlternatePhoneNumberChange = (
  //   phoneNumber: string,
  //   code: string
  // ) => {
  //   let digitsOnly = phoneNumber.replace(/\D/g, "");

  //   const countryDigits = code.replace("+", "");
  //   if (digitsOnly.startsWith(countryDigits)) {
  //     digitsOnly = digitsOnly.slice(countryDigits.length);
  //   }

  //   digitsOnly = digitsOnly.slice(0, 10);

  //   const formattedNumber = digitsOnly
  //     ? `${code}${digitsOnly}`
  //     : "";

  //   setNewEnquiry((prev) => ({
  //     ...prev,
  //     alternateContact: formattedNumber,
  //   }));

  //   setErrors((prev) => ({
  //     ...prev,
  //     alternateContact:
  //       digitsOnly.length === 10 ? "" : "Phone number must be 10 digits",
  //   }));
  // };


  const handleDateChange = (field: keyof NewEnquiryData, value: string) => {
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
    setFilledEnquiryData((prev) => ({
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

  const handleChange = (field: keyof NewEnquiryDataAll, value: string) => {
    let formattedValue = value;

    // Try to parse the entered value as a Date
    const parsedDate = new Date(value);

    // If valid date, format to dd/MM/yyyy
    if (!isNaN(parsedDate.getTime())) {
      const day = String(parsedDate.getDate()).padStart(2, "0");
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const year = parsedDate.getFullYear();
      formattedValue = `${day}/${month}/${year}`;
    }

    setFilledEnquiryData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    // Optional: validate or reset error
    if (field === "dob") {
      if (isNaN(parsedDate.getTime())) {
        setErrors((prev) => ({ ...prev, dob: "Invalid date format" }));
      } else {
        setErrors((prev) => ({ ...prev, dob: "" }));
      }
    }
  };


  const scrollToError = () => {
    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) return;

    const element = inputRefs.current[firstErrorKey];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleConfirmUpdate = async (reason: string) => {
    if (!pendingPayload) return;

    try {
      await editStudent({
        ...pendingPayload,
        changeReason: reason,
      });

      setShowChangeLog(false);

      setAlert({
        show: true,
        title: "Student Updated Successfully",
        message: "Student details updated successfully.",
        variant: "success",
      });

      setTimeout(() => {
        onCloseModal();
      }, 100);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
        variant: "error",
      });

      scrollModalToTop();

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

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 1000);

      return;
    }

    // Combine all data
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

    // 🔥 DO NOT CALL API HERE
    setPendingPayload(editStudentPayload);
    setShowChangeLog(true);

    return;

    // try {
    //   await editStudent(editStudentPayload);
    //   // reset form and show success alert as before

    //   // Wait 3 seconds before showing alert
    //   setAlert({
    //     show: true,
    //     title: "Student details Updated Successful",
    //     message: "Student admission has been successfully submitted.",
    //     variant: "success",
    //   });

    //   // Close modal after showing alert for 2 seconds (for example)
    //   setTimeout(() => {
    //     onCloseModal()
    //   }, 2000);
    // } catch (error) {   
    //   // handle error
    // }
  };

  console.log("get All EDIT Admission form data:", newEnquiry);
  console.log("get All Admission form editable data:", filledEnquiryData);
  console.log("get All PAYMENT TYPE OPTIONS::", paymentTypeOption);

  return (
    <ModalCard title="Edit Student Details" oncloseModal={onCloseModal} onBodyRef={(el) => (modalBodyRef.current = el)}>

      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={
              alert.title === "Admission Successful" ? "success" : "error"
            }
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}
        <div
          ref={(el) => {
            inputRefs.current["name"] = el;
          }}
        >
          <Label>Name</Label>
          <Input
            type="text"
            ref={firstInputRef}
            tabIndex={1}
            placeholder="Info Demo"
            value={newEnquiry.name}
            onChange={(e) => handleBasicChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div
          ref={(el) => {
            inputRefs.current["fatherName"] = el;
          }}
        >
          <Label>Father's Name</Label>
          <Input
            type="text"
            tabIndex={2}
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledEnquiryData.fatherName}
            onChange={(e) => handleExtendedChange("fatherName", e.target.value)}
          />
          {errors.fatherName && (
            <p className="text-sm text-red-500">{errors.fatherName}</p>
          )}
        </div>
        <div
          ref={(el) => {
            inputRefs.current["qualification"] = el;
          }}
        >
          <Label>Qualification</Label>
          <Input
            type="text"
            tabIndex={3}
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledEnquiryData.qualification}
            onChange={(e) => handleExtendedChange("qualification", e.target.value)}
          />
          {errors.qualification && (
            <p className="text-sm text-red-500">{errors.qualification}</p>
          )}
        </div>
        <div
          ref={(el) => {
            inputRefs.current["email"] = el;
          }}
        >
          <Label>Email</Label>
          <div className="relative">
            <Input
              tabIndex={4}
              placeholder="info@gmail.com"
              type="text"
              className="pl-[62px]"
              value={newEnquiry.email}
              onChange={(e) => handleBasicChange("email", e.target.value)}
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
          <Label>Student Contact</Label>
          <PhoneInput
            tabIndex={5}
            selectPosition="start"
            countries={countries}
            placeholder="+910000000000"
            value={newEnquiry.contact}
            onChange={(value, country) => handlePhoneNumberChange(value, "contact", country)}
          />
          {errors.contact && (
            <p className="text-sm text-red-500">{errors.contact}</p>
          )}
        </div>
        <div>
          <Label>Alternate Contact</Label>
          <PhoneInput
            tabIndex={6}
            selectPosition="start"
            countries={countries}
            placeholder="+91 55555 00000"
            value={filledEnquiryData.parentsContact}
            onChange={(value, country) => handlePhoneNumberChange(value, "parentsContact", country)}
          />
          {errors.parentsContact && (
            <p className="text-sm text-red-500">{errors.parentsContact}</p>
          )}
        </div>{" "}
        <div>
          <Label>Date Of Birth</Label>
          <Input
            tabIndex={7}
            type="date"
            placeholder="30-02-2002"
            //maxLength={10} // e.g. 12:30 PM
            value={filledEnquiryData.dob}
            onChange={(e) => handleExtendedChange("dob", e.target.value)}
          />
          {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
        </div>
        <div>
          <Label>Gender</Label>

          <div className="relative">
            <Select
              tabIndex={8}
              options={genders.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              placeholder="Select Gender"
              onChange={(value) => handleExtendedChange("gender", value)}
              value={filledEnquiryData.gender} // just the courseId string
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
        {/* <div>
          <Label>Religion</Label>
          <Input
            tabIndex={9}
            type="text"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledEnquiryData.religion}
            onChange={(e) => handleExtendedChange("religion", e.target.value)}
          />
          {errors.religion && (
            <p className="text-sm text-red-500">{errors.religion}</p>
          )}
        </div> */}
        <div>
          <Label>Select Id Proof</Label>
          <div className="relative">
            <Select
              tabIndex={12}
              options={options}
              placeholder="Select an option"
              value={filledEnquiryData.idProofType}
              onChange={(value) => handleExtendedChange("idProofType", value)}
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.idProofType && (
            <p className="text-sm text-red-500">{errors.idProofType}</p>
          )}
        </div>
        <div>
          <Label>
            <span className="capitalize">
              {filledEnquiryData.idProofType
                ? filledEnquiryData.idProofType.charAt(0).toUpperCase() +
                filledEnquiryData.idProofType.slice(1).toLowerCase()
                : ""}
            </span>{" "}
            Number
          </Label>
          <Input
            tabIndex={13}
            type="text"
            placeholder="Info Demo"
            onChange={(e) => handleExtendedChange("idProofNumber", e.target.value)}
            value={filledEnquiryData.idProofNumber}
          />
          {errors.idProofNumber && (
            <p className="text-sm text-red-500">{errors.idProofNumber}</p>
          )}
        </div>
        <div>
          <Label>Residential Address</Label>
          <Input
            tabIndex={14}
            type="text"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledEnquiryData.residentialAddress}
            onChange={(e) => handleExtendedChange("residentialAddress", e.target.value)}
          />
          {errors.residentialAddress && (
            <p className="text-sm text-red-500">{errors.residentialAddress}</p>
          )}
        </div>
        <div>
          <Label>Permenant Address</Label>

          <Input
            tabIndex={15}
            type="text"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledEnquiryData.permenantAddress}
            onChange={(e) => handleExtendedChange("permenantAddress", e.target.value)}
          />
          {errors.permenantAddress && (
            <p className="text-sm text-red-500">{errors.permenantAddress}</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm" variant="outline" tabIndex={12} onClick={onCloseModal}>
            Close
          </Button>
          <Button size="sm" tabIndex={19} className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
            Save
          </Button>
        </div>

        <ChangeLogModal
          isOpen={showChangeLog}
          onClose={() => setShowChangeLog(false)}
          onConfirm={handleConfirmUpdate}
        />

      </div>
    </ModalCard>
  );
}
