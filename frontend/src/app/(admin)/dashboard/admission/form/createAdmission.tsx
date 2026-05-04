"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronDownIcon, EnvelopeIcon } from "@/icons";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";
import { useCreateAdvancePayment } from "@/hooks/mutations/useMutationAdvancePayment";
import { useDispatch, useSelector } from "react-redux";
import { useFetchAllCourses } from "@/hooks/queries/useQueryFetchCourseData";
import { setCourses } from "@/store/slices/courseSlice";
import { RootState } from "@/store";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Select from "@/components/form/Select";
import DropzonBoxComponent from "@/components/form/form-elements/DropBox";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useFetchEnquiryById } from "@/hooks/queries/useQueryFetchEnquiry";
import { setBatches } from "@/store/slices/batchSlice";
import MultiSelect from "@/components/form/MultiSelect";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { capitalizeWords } from "@/components/common/ToCapitalize";
import TextArea from "@/components/form/input/TextArea";
import { countries } from "@/components/common/CountriesCode";
import { genders, options } from "@/components/common/Options";
import { useScrollToError } from "@/app/utils/ScrollToError";
import { titleCase } from "@/app/utils/Normalize";
import ComponentCard from "@/components/common/ComponentCard";

type FormErrors = Partial<Record<keyof NewEnquiryDataAll, string>>;

interface EnquiryData {
  id: string;
  name: string;
  email: string;
  courseId: string[];
  alternateContact?: string;
  age: string;
  location: string;
  gender: string;
  dob: string;
  referedBy: string;
  contact: string;
}

interface EnquiryDataNew {
  id: string;
  name: string;
  email: string;
  courseId: string[];
  alternateContact?: string;
  age: string;
  location: string;
  gender: string;
  dob: string;
  referedBy: string;
  contact: string;
  enquiryCourse: any[];
}

interface NewEnquiryData {
  idProofType: string;
  idProofNumber: string;
  localAddressProofType: string;
  localAddressProofNumber: string;
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
  idCard: boolean;
  bag: boolean;
}

interface NewEnquiryDataAll {
  name: string;
  email: string;
  courseId: string[];
  contact: string;
  idProofType: string;
  idProofNumber: string;
  localAddressProofType: string;
  localAddressProofNumber: string;
  address: string;
  admissionDate: any;
  feeAmount: string;
  paymentType: string;
  gender: string;
  dob: string;
  batchId: string;
  facultyId: string;
  residentialAddress: string;
  permenantAddress: string;
  parentsContact: string;
  fatherName: string;
  qualification: string;
  idCard: boolean;
  bag: boolean;
  referedBy: string;
  installmentTypeId: string;
  selectedProfilePicture: any[];
}

export default function AdmissionForm() {
  const [enquiryData, setEnquiryData] = useState<EnquiryDataNew>({
    id: "",
    name: "",
    email: "",
    courseId: [],
    alternateContact: "",
    age: "",
    location: "",
    gender: "",
    dob: "",
    referedBy: "",
    contact: "",
    enquiryCourse: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const [courseRows, setCourseRows] = useState([
    {
      courseId: "",
      paymentType: "",
      installmentTypeId: "",
      feeAmount: "",
      batchId: "",
      advanceAmount: "",
    },
  ]);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <p>Invalid admission</p>;

  const [newEnquiry, setNewEnquiry] = useState<EnquiryData>({
    id: "",
    name: "",
    email: "",
    courseId: [],
    alternateContact: "",
    age: "",
    location: "",
    gender: "",
    dob: "",
    referedBy: "",
    contact: "",
  });

  const [filledEnquiryData, setFilledEnquiryData] = useState<NewEnquiryData>({
    idProofType: "",
    idProofNumber: "",
    localAddressProofType: "",
    localAddressProofNumber: "",
    address: "",
    admissionDate: "",

    gender: "",
    residentialAddress: "",
    permenantAddress: "",
    parentsContact: "",
    fatherName: "",
    qualification: "",
    dob: "",
    idCard: false,
    bag: false,
    facultyId: "",
  });

  console.log("Filled Data at Start of initialioze:", filledEnquiryData);

  const router = useRouter();
  const [sameAsResidential, setSameAsResidential] = useState(false);
  const { data, isLoading } = useFetchEnquiryById(id as string);
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

  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const batch = useSelector((state: RootState) => state.batch.batches ?? []);

  const courses = useSelector((state: RootState) => state.course.courses ?? []);

  //const inputRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { inputRefs, scrollToError } = useScrollToError();

  // const [errors, setErrors] = useState<Partial<NewEnquiryDataAll>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentTypeOption, setpaymentTypeOption] = useState<any>([]);
  const [installmentTypeOption, setInstallmentTypeOption] = useState<any>([]);
  const { mutate: createAdmission } = useCreateAdmission();
  const { mutate: createAdvancePayment } = useCreateAdvancePayment();

  const firstInputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   if (newEnquiry.name !== undefined && firstInputRef.current) {
  //     firstInputRef.current.focus();
  //   }
  // }, []);


  useEffect(() => {
    if (!isLoading && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isLoading]);

  console.log("Redux state in edit:", useSelector(state => state));

  const stripCountryCode = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/^\+91/, "");
  };

  useEffect(() => {
    if (data?.enquiry) {
      setEnquiryData(data.enquiry);
    }
  }, [data]);

  useEffect(() => {
    if (!newEnquiry.courseId.length) return;

    const rows = newEnquiry.courseId.map((id) => ({
      courseId: id,
      paymentType: "",
      installmentTypeId: "",
      feeAmount: "",
      batchId: "",
      advanceAmount: "",
    }));

    setCourseRows(rows);
  }, [newEnquiry.courseId]);

  useEffect(() => {
    if (!courses.length || !newEnquiry.courseId.length) return;
  }, [courses, newEnquiry.courseId]);

  // const handleCourseRowChange = (index: number, field: string, value: any) => {
  //   setCourseRows((prev) => {
  //     const updated = [...prev];
  //     updated[index] = { ...updated[index], [field]: value };

  //     const row = updated[index];

  //     // Find selected course
  //     const selectedCourse = courses.find(
  //       (c) => c.id.toString() === row.courseId,
  //     );

  //     const installmentTypes =
  //       selectedCourse?.courseFeeStructure?.installments || [];

  //     // Update feeAmount for ONE_TIME
  //     if (field === "paymentType" && value === "ONE_TIME") {
  //       updated[index].feeAmount =
  //         selectedCourse?.courseFeeStructure?.totalAmount?.toString() || "";
  //     }

  //     // Reset fee + installment if switching paymentType
  //     if (field === "paymentType" && value !== "INSTALLMENT") {
  //       updated[index].installmentTypeId = "";
  //     }

  //     // Update feeAmount for INSTALLMENT
  //     if (field === "installmentTypeId") {
  //       const selectedInstallment = installmentTypes.find(
  //         (i: any) => i.id.toString() === value.toString(),
  //       );

  //       updated[index].feeAmount = selectedInstallment
  //         ? selectedInstallment.amount.toString()
  //         : "";
  //     }

  //     return updated;
  //   });
  // };

  const handleCourseRowChange = useCallback(
    (index: number, field: string, value: any) => {
      setCourseRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };

        const course = courses.find(
          (c) => c.id.toString() === updated[index].courseId
        );

        if (!course?.courseFeeStructure) return updated;

        if (field === "paymentType" && value === "ONE_TIME") {
          updated[index].feeAmount =
            course.courseFeeStructure.totalAmount?.toString() || "";
          updated[index].installmentTypeId = "";
        }

        if (field === "installmentTypeId") {
          const inst = course.courseFeeStructure.installments?.find(
            (i: any) => i.id.toString() === value
          );
          updated[index].feeAmount = inst?.amount?.toString() || "";
        }

        return updated;
      });
    },
    [courses]
  );

  useEffect(() => {
    if (!enquiryData || !enquiryData.enquiryCourse) return;

    let dobValue = "";
    if (enquiryData.dob) {
      const date = new Date(enquiryData.dob);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      dobValue = `${day}-${month}-${year}`; // DD-MM-YYYY
    }

    const courseIds = enquiryData.enquiryCourse.map((c: any) =>
      String(c.courseId),
    );

    setNewEnquiry({
      id: enquiryData.id,
      name: enquiryData.name || "",
      email: enquiryData.email || "",
      contact: enquiryData.contact || "",
      alternateContact: enquiryData.alternateContact || "",
      age: enquiryData.age || "",
      location: enquiryData.location || "",
      gender: enquiryData.gender || "",
      dob: enquiryData.dob
        ? enquiryData.dob.split("T")[0] // ✅ FIX HERE
        : "",
      referedBy: enquiryData.referedBy || "",
      courseId: courseIds, // -------------------------- FIXED
    });
  }, [enquiryData]);

  useEffect(() => {
    if (!enquiryData) return;

    let dobValue = "";
    if (enquiryData.dob) {
      const date = new Date(enquiryData.dob);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      dobValue = `${day}/${month}/${year}`; // DD-MM-YYYY
    }

    const dobISO = enquiryData.dob
      ? enquiryData.dob.split("T")[0] // ✅ YYYY-MM-DD
      : "";

    setFilledEnquiryData((prev) => ({
      ...prev,
      dob: dobISO,
      gender: enquiryData.gender || "",
      parentsContact: enquiryData.alternateContact || "", // default to ""
    }));

    // Also set in newEnquiry if needed for internal use
    setNewEnquiry((prev) => ({
      ...prev,
      dob: dobValue,
    }));
  }, [enquiryData]);


  useEffect(() => {
    if (
      enquiryData &&
      enquiryData?.enquiryCourse &&
      Object.keys(enquiryData).length > 0
    ) {
      console.log("🔥 Setting enquiry data to form:", enquiryData);

      // Extract course IDs from enquiryCourse array
      const courseIds: string[] = enquiryData.enquiryCourse
        ? enquiryData.enquiryCourse.map((ec: any) => String(ec.courseId))
        : [];

      setNewEnquiry({
        id: enquiryData.id,
        name: enquiryData.name || "",
        email: enquiryData.email || "",
        courseId: courseIds, // ✅ set extracted course IDs
        alternateContact: enquiryData.alternateContact || "",
        age: enquiryData.age || "",
        location: enquiryData.location || "",
        gender: enquiryData.gender || "",
        dob: enquiryData.dob
          ? enquiryData.dob.split("T")[0] // ✅ FIX HERE
          : "",
        referedBy: enquiryData.referedBy || "",
        contact: enquiryData.contact || "",
      });
    }
  }, [enquiryData]);

  useEffect(() => {
    if (sameAsResidential) {
      setFilledEnquiryData((prev) => ({
        ...prev,
        permenantAddress: prev.residentialAddress,
      }));
    }
  }, [filledEnquiryData.residentialAddress, sameAsResidential]);

  useEffect(() => {
    console.log("🎯 enquiryData changed:", enquiryData);
  }, [enquiryData, data]);

  // useEffect(() => {
  //   if (!enquiryData || !enquiryData.enquiryCourse) return;

  //   // ----------------- Parse DOB -----------------
  //   let dobForForm = "";
  //   let dobForFilledData = "";

  //   if (enquiryData.dob) {
  //     const date = new Date(enquiryData.dob);
  //     const day = String(date.getDate()).padStart(2, "0");
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const year = date.getFullYear();

  //     dobForForm = enquiryData.dob.split("T")[0]; // YYYY-MM-DD for inputs
  //     dobForFilledData = `${day}/${month}/${year}`; // DD/MM/YYYY for display
  //   }

  //   // ----------------- Extract course IDs -----------------
  //   const courseIds: string[] = enquiryData.enquiryCourse.map(
  //     (c: any) => String(c.courseId)
  //   );

  //   // ----------------- Set newEnquiry -----------------
  //   setNewEnquiry({
  //     id: enquiryData.id,
  //     name: enquiryData.name || "",
  //     email: enquiryData.email || "",
  //     contact: enquiryData.contact || "",
  //     alternateContact: enquiryData.alternateContact || "",
  //     age: enquiryData.age || "",
  //     location: enquiryData.location || "",
  //     gender: enquiryData.gender || "",
  //     dob: dobForForm,
  //     referedBy: enquiryData.referedBy || "",
  //     courseId: courseIds,
  //   });

  //   // ----------------- Set filledEnquiryData -----------------
  //   setFilledEnquiryData((prev) => ({
  //     ...prev,
  //     dob: dobForFilledData,
  //     gender: enquiryData.gender || "",
  //     parentsContact: enquiryData.alternateContact || "",
  //   }));

  //   console.log("🎯 enquiryData initialized:", enquiryData);
  // }, [enquiryData]);

  useEffect(() => {
    if (!newEnquiry.courseId) return;
    if (!courses || courses.length === 0) return;

    const selectedCourse = courses.find(
      (c) => c.id.toString() === newEnquiry.courseId,
    );

    if (!selectedCourse?.courseFeeStructure) return;

    // PAYMENT TYPE OPTIONS
    setpaymentTypeOption(selectedCourse.courseFeeStructure.paymentType);

    // INSTALLMENT OPTIONS
    const inst = selectedCourse.courseFeeStructure.installments || [];
    setInstallmentTypeOption(inst);

  }, [courses, newEnquiry.courseId]);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchAllCourses();

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches({ onlyAvailable: true });

  useEffect(() => {
    if (courseData?.course) {
      console.log("get all courses data;", courseData);
      dispatch(setCourses(courseData.course || []));
      setLoading(false);
    };
  }, [courseData, dispatch]);


  useEffect(() => {
    console.log("get all batches data;", batchData);
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch || []));
      setLoading(false);
    };
  }, [batchData, dispatch]);
  console.log("get all batches data::::::::::::::::::::::::::::::::::::::::::::::::;", batchData)
  console.log("get all courses data::::::::::::::::::::::::::::::::::::::::::::::::;", courseData)

  // const batchOptions = batch.map((b: any) => ({
  //   value: b.id.toString(),
  //   label: `${capitalizeWords(b.name)} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  // }));

  const batchOptions = React.useMemo(
    () =>
      batch.map((b: any) => ({
        value: b.id.toString(),
        label: `${(b.name)} | PCs: ${b.labTimeSlot.availablePCs}`,
      })),
    [batch]
  );

  useEffect(() => {
    if (courseData?.course && batchData?.batch) {
      dispatch(setCourses(courseData.course));
      dispatch(setBatches(batchData.batch));
      setLoading(false);
    }
  }, [courseData, batchData, dispatch]);

  // const handlePhoneNumberChange = (
  //   field: "contact" | "parentsContact",
  //   phoneNumber: string,
  //   countryCode = "+91"
  // ) => {
  //   let formattedNumber = phoneNumber;
  //   if (!phoneNumber.startsWith("+")) {
  //     formattedNumber = countryCode + phoneNumber.replace(/^0+/, "");
  //   }

  //   if (field === "contact") {
  //     setNewEnquiry((prev) => ({
  //       ...prev,
  //       contact: formattedNumber,
  //     }));
  //     setErrors((prev) => ({ ...prev, contact: "" }));
  //   } else {
  //     setFilledEnquiryData((prev) => ({
  //       ...prev,
  //       parentsContact: formattedNumber,
  //     }));
  //     setErrors((prev) => ({ ...prev, parentsContact: "" }));
  //   }
  // };

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

  const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
    // const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);
    //const formattedNumber = code + phoneNumber;

    // Extract digits only
    const digitsOnly = phoneNumber.replace(/\D/g, "").slice(0, 10);

    const formattedNumber = code + digitsOnly;

    setNewEnquiry((prev) => ({
      ...prev,
      contact: formattedNumber,
    }));


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
    setFilledEnquiryData((prev) => ({
      ...prev,
      parentsContact: formattedNumber,
    }));


    // Validation
    if (phoneNumber.length === 10) {
      setErrors((prev) => ({ ...prev, parentsContact: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        parentsContact: "Phone number must be 10 digits",
      }));
    }
  };


  if (loading === true) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 🔹 Basic Enquiry Info
    if (!newEnquiry.name.trim()) newErrors.name = "Student name is required.";

    // if (!newEnquiry.email.trim()) newErrors.email = "Email is required.";
    // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email))
    //   newErrors.email = "Please enter a valid email address.";

    if (!newEnquiry.contact.trim())
      newErrors.contact = "Contact number is required.";

    if (!newEnquiry.courseId) newErrors.courseId = "Please select a course.";

    // 🔹 Extended Admission Details
    // if (!filledEnquiryData.fatherName.trim())
    //   newErrors.fatherName = "Father's name is required.";
    // if (!filledEnquiryData.qualification.trim())
    //   newErrors.qualification = "Qualification is required.";
    // if (!filledEnquiryData.gender.trim())
    //   newErrors.gender = "Gender is required.";

    // if (!filledEnquiryData.dob.trim())
    //   newErrors.dob = "Date of birth is required.";
    // else if (!/^\d{4}-\d{2}-\d{2}$/.test(filledEnquiryData.dob))
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

    if (!filledEnquiryData.admissionDate)
      newErrors.admissionDate = "Admission date is required.";

    // Optional: validate ID proof type/number pattern
    // if (
    //   filledEnquiryData.idProofType === "aadhar card" &&
    //   !/^\d{12}$/.test(filledEnquiryData.idProofNumber)
    // )
    //   newErrors.idProofNumber = "Aadhar number must be 12 digits.";

    // // Optional: validate ID proof type/number pattern
    // if (
    //   filledEnquiryData.idProofType === "pan card" &&
    //   !/^\d{10}$/.test(filledEnquiryData.idProofNumber)
    // )
    //   newErrors.idProofNumber = "Pan number must be 10 digits.";

    // if (!selectedProfilePicture)
    //   newErrors.selectedProfilePicture = "Profiloe Picture is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

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

  const handleChange = (field: keyof NewEnquiryData, value: string) => {
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

  // const scrollToError = (errs: Record<string, string>) => {
  //   const firstErrorKey = Object.keys(errs)[0];
  //   if (!firstErrorKey) return;

  //   const element = inputRefs.current[firstErrorKey];
  //   if (element) {
  //     element.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //     });

  //     // optional focus
  //     const input = element.querySelector("input, textarea, select") as HTMLElement;
  //     input?.focus();
  //   }
  // };

  const handleChangeNew = (field: keyof EnquiryData, value: any) => {
    setNewEnquiry((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "courseId") {
      const selectedCourses = courses.filter((course) =>
        value.includes(course.id.toString()),
      );

      // Merge payment types from All selected courses
      const mergedPaymentTypes = [
        ...new Set(
          selectedCourses.flatMap(
            (c: any) => c.courseFeeStructure?.paymentType || [],
          ),
        ),
      ];

      setpaymentTypeOption(mergedPaymentTypes);

      // Reset fee when course changes
      setFilledEnquiryData((prev) => ({
        ...prev,
        feeAmount: "",
        installmentTypeId: "",
        paymentType: "",
      }));

      setCourseRows((prev) => []);
    }
  };

  const handleAdvancePayment = async () => {
    // Validate that at least one course has advance amount
    const hasAdvancePayment = courseRows.some(row => row.advanceAmount && parseFloat(row.advanceAmount) > 0);
    
    if (!hasAdvancePayment) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter advance amount for at least one course.",
        variant: "error",
      });
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
      return;
    }

    try {
      // Create advance payment data for courses with advance amounts
      const advancePayments = courseRows
        .filter(row => row.advanceAmount && parseFloat(row.advanceAmount) > 0)
        .map(row => {
          const selectedCourse = courses.find(c => c.id.toString() === row.courseId);
          return {
            courseId: row.courseId,
            courseName: selectedCourse?.name || "",
            advanceAmount: parseFloat(row.advanceAmount),
            paymentMode: "CASH",
            paymentDate: new Date().toISOString()
          };
        });

      // Call API to process advance payments
      createAdvancePayment(advancePayments, {
        onSuccess: (response: any) => {
          console.log("Advance payments processed:", response);
          
          setAlert({
            show: true,
            title: "Success",
            message: response.message || `Advance payment processed for ${advancePayments.length} course(s)`,
            variant: "success",
          });

          // Clear advance amounts after processing
          setCourseRows(prev => 
            prev.map(row => ({ ...row, advanceAmount: "" }))
          );

          setTimeout(() => {
            setAlert({ show: false, title: "", message: "", variant: "" });
          }, 3000);
        },
        onError: (error: any) => {
          console.error("Advance payment error:", error);
          setAlert({
            show: true,
            title: "Error",
            message: error.message || "Failed to process advance payment. Please try again.",
            variant: "error",
          });
        }
      });

    } catch (error) {
      console.error("Advance payment error:", error);
      setAlert({
        show: true,
        title: "Error",
        message: "Failed to process advance payment. Please try again.",
        variant: "error",
      });
    }
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validate();

    if (!isValid) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
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

    // Prepare advance payment data
    const advancePaymentData = courseRows
      .filter(row => row.advanceAmount && parseFloat(row.advanceAmount) > 0)
      .map(row => {
        const selectedCourse = courses.find(c => c.id.toString() === row.courseId);
        return {
          courseId: row.courseId,
          courseName: selectedCourse?.name || "",
          advanceAmount: parseFloat(row.advanceAmount),
          paymentMode: "CASH",
          paymentDate: new Date().toISOString()
        };
      });

    // Combine all data
    const admissionPayload = {
      token,
      id: newEnquiry.id,
      name: newEnquiry.name,
      email: newEnquiry.email,
      referedBy: newEnquiry.referedBy,
      contact: newEnquiry.contact,
      facultyId: filledEnquiryData.facultyId,

      courseData: courseRows,
      idProofType: filledEnquiryData.idProofType,
      idProofNumber: filledEnquiryData.idProofNumber,
      admissionDate: filledEnquiryData.admissionDate,

      gender: filledEnquiryData.gender,
      residentialAddress: filledEnquiryData.residentialAddress,
      permenantAddress: filledEnquiryData.permenantAddress,
      parentsContact: filledEnquiryData.parentsContact,
      fatherName: filledEnquiryData.fatherName,
      qualification: filledEnquiryData.qualification,
      dob: filledEnquiryData.dob,

      localAddressProofType: filledEnquiryData.localAddressProofType,
      localAddressProofNumber: filledEnquiryData.localAddressProofNumber,
      idCard: filledEnquiryData.idCard,
      bag: filledEnquiryData.bag,

      profilePicture: selectedProfilePicture, // you'll need to track this in state
      advancePayments: advancePaymentData, // Add advance payment data
    };

    // try {
    //   await createAdmission(admissionPayload);
    //   // reset form and show success alert as before
    //   // Wait 3 seconds before showing alert
    //   setAlert({
    //     show: true,
    //     title: "Admission Successful",
    //     message: "Student admission has been successfully submitted.",
    //     variant: "success",
    //   });

    //   window.scrollTo({
    //     top: 0, behavior: "smooth"
    //   })

    //   // Close modal after showing alert for 2 seconds (for example)
    //   setTimeout(() => {
    //     router.back();
    //   }, 1000);
    // } catch (error) {
    //   // handle error
    // }

    createAdmission(admissionPayload, {
      onSuccess: (response: any) => {
        console.log("Student admission created:", response);

        // After successful student creation, update any advance payment records
        // const updateAdvancePayments = async () => {
        //   try {
        //     // Check if there are any advance payments to update
        //     const hasAdvancePayments = courseRows.some(row => row.advanceAmount && parseFloat(row.advanceAmount) > 0);
            
        //     if (hasAdvancePayments) {
        //       // Create a service call to update advance payment records with student ID
        //       const token = sessionStorage.getItem("token");
        //       if (token) {
        //         // For each course with advance payment, update the records
        //         const coursesWithAdvance = courseRows.filter(row => row.advanceAmount && parseFloat(row.advanceAmount) > 0);
                
        //         for (const course of coursesWithAdvance) {
        //           // This would be handled by the backend service automatically
        //           console.log(`Advance payment records for course ${course.courseId} will be updated with student ID`);
        //         }
        //       }
        //     }
        //   } catch (error) {
        //     console.error("Error updating advance payments:", error);
        //   }
        // };

        // updateAdvancePayments();

        window.scrollTo({
          top: 0, behavior: "smooth"
        })

        setAlert({
          show: true,
          title: "Admission Successful",
          message: "Student admission has been successfully submitted.",
          variant: "success",
        });

        setTimeout(() => {
          router.back();
        }, 1000);
      },

      onError: (error: any) => {
        console.error("Error creating admission:", error);
        // You already handle error via redux + toast
        window.scrollTo({
          top: 0, behavior: "smooth"
        })
      },
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Student Admission" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">

        <div className="space-y-8">
          <h2 className="border-b pb-6 text-gray-800 dark:text-gray-50 dark:border-gray-700">Student Infomation</h2>

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
                inputRefs.current.name = el;
              }}
            >
              <Label>Name</Label>
              <Input
                type="text"
                autoFocus
                ref={firstInputRef}
                tabIndex={1}
                placeholder="Enter Student Name"
                value={titleCase(newEnquiry.name)}
                onChange={(e) => handleChangeNew("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div
              ref={(el) => {
                inputRefs.current.fatherName = el; // ✅ different key
              }}
            >
              <Label>Father's Name</Label>
              <Input
                type="text"
                tabIndex={2}

                placeholder="Enter Father Name"
                value={titleCase(filledEnquiryData.fatherName)}
                onChange={(e) => handleChange("fatherName", e.target.value)}
              />
              {errors.fatherName && (
                <p className="text-sm text-red-500">{errors.fatherName}</p>
              )}
            </div>



            <div
              ref={(el) => {
                inputRefs.current.email = el; // ✅ different key
              }}
            >
              <Label>Email</Label>
              <div className="relative">
                <Input
                  tabIndex={4}
                  placeholder="Enter Student Email"
                  type="text"
                  className="pl-[62px]"
                  value={newEnquiry.email}
                  onChange={(e) => handleChangeNew("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
                <span className="absolute top-1/2 left-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <EnvelopeIcon />
                </span>
              </div>
            </div>

            <div ref={(el) => {
              inputRefs.current.contact = el; // ✅ different key
            }}>
              <Label>Student Contact</Label>
              <PhoneInput
                tabIndex={5}
                selectPosition="start"
                countries={countries}
                placeholder="Enter Student Contact"
                value={stripCountryCode(newEnquiry.contact)} // 👈 IMPORTANT
                onChange={(value, country) => handlePhoneNumberChange(value, country)}
              />

              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
            </div>

            <div ref={(el) => {
              inputRefs.current.parentsContact = el; // ✅ different key
            }}>
              <Label>Alternate Contact</Label>
              <PhoneInput
                tabIndex={6}
                selectPosition="start"
                countries={countries}
                value={stripCountryCode(filledEnquiryData.parentsContact)} // 👈 IMPORTANT
                placeholder="Enter Alternate Contact"
                onChange={(value, country) => handleAlternatePhoneNumberChange(value, country)}
              />

              {errors.parentsContact && (
                <p className="text-sm text-red-500">{errors.parentsContact}</p>
              )}
            </div>{" "}

            <div
              ref={(el) => {
                inputRefs.current.qualification = el; // ✅ different key
              }}
            >
              <Label>Qualification</Label>
              <Input
                type="text"
                tabIndex={3}
                placeholder="Enter Qualification"
                value={titleCase(filledEnquiryData.qualification)}
                onChange={(e) => handleChange("qualification", e.target.value)}
              />
              {errors.qualification && (
                <p className="text-sm text-red-500">{errors.qualification}</p>
              )}
            </div>

            <div ref={(el) => {
              inputRefs.current.dob = el; // ✅ different key
            }}>
              <Label>Date Of Birth</Label>
              <Input
                tabIndex={7}
                type="date"
                placeholder="Enter DoB"
                //maxLength={10} // e.g. 12:30 PM
                value={filledEnquiryData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
              {errors.dob && (
                <p className="text-sm text-red-500">{errors.dob}</p>
              )}
            </div>

            <div ref={(el) => {
              inputRefs.current.gender = el; // ✅ different key
            }}>
              <Label>Gender</Label>

              <div className="relative">
                <Select
                  tabIndex={8}
                  options={genders.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  placeholder="Select Gender"
                  onChange={(value) => handleChange("gender", value)}
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

            {/* Select Course */}
            <div ref={(el) => {
              inputRefs.current.courseId = el; // ✅ different key
            }}>
              <div className="relative" data-master="course">
                <MultiSelect
                  tabIndex={10}
                  options={courses.map((course) => ({
                    value: String(course.id),
                    text: course.name,
                    selected: newEnquiry.courseId.includes(String(course.id)),
                  }))}
                  label="Select Courses"
                  value={newEnquiry.courseId}
                  onChange={(value) => handleChangeNew("courseId", value)}
                />
              </div>
              {errors.courseId && (
                <p className="text-sm text-red-500">{errors.courseId}</p>
              )}
            </div>

            {/* Payment Type */}
            {courseRows.map((row, index) => {
              const selectedCourse = courses.find(
                (c) => c.id.toString() === row.courseId,
              );

              const paymentTypes =
                selectedCourse?.courseFeeStructure?.paymentType || [];
              const installmentTypes =
                selectedCourse?.courseFeeStructure?.installments || [];

              return (
                <ComponentCard key={row.courseId || index} title="Course Selection">
                  <h3 className="my-1 font-semibold text-gray-800 dark:text-gray-300">
                    Course #{index + 1}: {selectedCourse?.name}
                  </h3>

                  {/* Payment Type */}
                  <div ref={(el) => {
                    inputRefs.current.paymentType = el; // ✅ different key
                  }}>
                    <Label>Select Payment Type</Label>
                    <div className="relative">
                      <Select
                        options={paymentTypes.map((pt: any) => ({
                          label: pt,
                          value: pt,
                        }))}
                        onChange={(value) =>
                          handleCourseRowChange(index, "paymentType", value)
                        }
                        value={row.paymentType}
                        placeholder="Select Payment Type"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>

                  {/* Installment Type — only if selected */}
                  {row.paymentType === "INSTALLMENT" &&
                    installmentTypes.length > 0 && (
                      <div className="mt-3">
                        <Label>Select Installment Type</Label>
                        <div className="relative">
                          <Select
                            options={installmentTypes.map((ins: any) => ({
                              label: `${ins.number} Installments - ₹${ins.amount}`,
                              value: ins.id,
                            }))}
                            onChange={(value) =>
                              handleCourseRowChange(
                                index,
                                "installmentTypeId",
                                value,
                              )
                            }
                            value={row.installmentTypeId}
                            placeholder="Select Installment"
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Fee Amount */}
                  <div className="mt-3">
                    <Label>Fee Amount</Label>
                    <Input
                      disabled
                      value={
                        row.paymentType === "ONE_TIME"
                          ? selectedCourse?.courseFeeStructure?.totalAmount ||
                          ""
                          : row.paymentType === "INSTALLMENT"
                            ? installmentTypes.find(
                              (i: any) =>
                                i.id.toString() === row.installmentTypeId,
                            )?.amount || ""
                            : ""
                      }
                    />
                  </div>

                  {/* Batch */}
                  <div className="mt-3">
                    <Label>Select Batch</Label>
                    <div className="relative" data-master="lab">
                      <Select
                        options={batchOptions.filter(
                          (bt: any) =>
                            !courseRows
                              .filter((_, i) => i !== index) // other rows
                              .map((r) => r.batchId)
                              .includes(bt.value), // remove already assigned batch
                        )}
                        onChange={(value) =>
                          handleCourseRowChange(index, "batchId", value)
                        }
                        value={row.batchId}
                        placeholder="Select Batch"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    </div>
                  {/* Advance Payment */}
                  <div className="mt-3">
                    <Label>Advance Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter Advance Amount"
                      value={row.advanceAmount}
                      onChange={(e) =>
                        handleCourseRowChange(index, "advanceAmount", e.target.value)
                      }
                    />
                  </div>
                </ComponentCard>
              );
            })}

            {/* Advance Payment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  id="showAdvancePayment"
                  checked={showAdvancePayment}
                  onChange={(e) => setShowAdvancePayment(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showAdvancePayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enable Advance Payment Collection
                </label>
              </div>

              {showAdvancePayment && (
                <ComponentCard title="Advance Payment Summary">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-3">Collect Advance Payments</h3>
                    {courseRows.map((row, index) => {
                      const selectedCourse = courses.find(
                        (c) => c.id.toString() === row.courseId,
                      );
                      return (
                        <div key={index} className="border rounded p-3 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{selectedCourse?.name}</p>
                              <p className="text-sm text-gray-600">
                                Total Fee: ₹{row.feeAmount || "0"}
                              </p>
                            </div>
                            <div className="text-right">
                              <Input
                                type="number"
                                placeholder="Advance Amount"
                                value={row.advanceAmount}
                                onChange={(e) =>
                                  handleCourseRowChange(index, "advanceAmount", e.target.value)
                                }
                                className="w-32"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Clear advance amounts
                          setCourseRows(prev => 
                            prev.map(row => ({ ...row, advanceAmount: "" }))
                          );
                        }}
                      >
                        Clear Advances
                      </Button>
                      {/* <Button 
                        variant="primary"
                        onClick={handleAdvancePayment}
                        disabled={courseRows.every(row => !row.advanceAmount || parseFloat(row.advanceAmount) <= 0)}
                      >
                        Take Advance Payment
                      </Button> */}
                    </div>
                  </div>
                </ComponentCard>
              )}
            </div>

            {/* Id Proof Type */}
            <ComponentCard title="Id Proof">
              <div ref={(el) => {
                inputRefs.current.idProofType = el; // ✅ different key
              }}>
                <Label>Select Id Proof</Label>
                <div className="relative">
                  <Select
                    tabIndex={12}
                    options={options}
                    placeholder="Select Id Proof"
                    onChange={(value) => handleChange("idProofType", value)}
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
              <div ref={(el) => {
                inputRefs.current.idProofNumber = el; // ✅ different key
              }}>
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
                  placeholder="Enter Id No."
                  onChange={(e) => handleChange("idProofNumber", e.target.value)}
                  value={filledEnquiryData.idProofNumber}
                />
                {errors.idProofNumber && (
                  <p className="text-sm text-red-500">{errors.idProofNumber}</p>
                )}
              </div>
            </ComponentCard>

            {/* Local Address Proof Type */}
            <ComponentCard title="Local Address Proof">
              <div ref={(el) => {
                inputRefs.current.localAddressProofType = el; // ✅ different key
              }}>
                <Label>Select Local Add. Proof</Label>
                <div className="relative">
                  <Select
                    tabIndex={12}
                    options={options}
                    placeholder="Select Id Proof"
                    onChange={(value) => handleChange("localAddressProofType", value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors.localAddressProofType && (
                  <p className="text-sm text-red-500">{errors.localAddressProofType}</p>
                )}
              </div>
              <div ref={(el) => {
                inputRefs.current.localAddressProofNumber = el; // ✅ different key
              }}>
                <Label>
                  <span className="capitalize">
                    {filledEnquiryData.localAddressProofType
                      ? filledEnquiryData.localAddressProofType.charAt(0).toUpperCase() +
                      filledEnquiryData.localAddressProofType.slice(1).toLowerCase()
                      : ""}
                  </span>{" "}
                  Number
                </Label>
                <Input
                  tabIndex={13}
                  type="text"
                  placeholder="Enter Id No."
                  onChange={(e) => handleChange("localAddressProofNumber", e.target.value)}
                  value={filledEnquiryData.localAddressProofNumber}
                />
                {errors.localAddressProofNumber && (
                  <p className="text-sm text-red-500">{errors.localAddressProofNumber}</p>
                )}
              </div>
            </ComponentCard>


            {/* Residential Address */}
            <div ref={(el) => {
              inputRefs.current.residentialAddress = el; // ✅ different key
            }}>
              <Label>Residential Address</Label>
              <TextArea
                tabIndex={14}
                placeholder="Enter Student Residential Address"
                value={filledEnquiryData.residentialAddress}
                onChange={(value) =>
                  handleChange("residentialAddress", value)
                }
              />
              {errors.residentialAddress && (
                <p className="text-sm text-red-500">
                  {errors.residentialAddress}
                </p>
              )}
            </div>



            {/* Permenant Address */}
            <div ref={(el) => {
              inputRefs.current.permenantAddress = el; // ✅ different key
            }}>
              <Label>Permenant Address</Label>

              <TextArea
                tabIndex={15}
                placeholder="Enter Student Permenant Address"
                value={filledEnquiryData.permenantAddress}
                onChange={(value) =>
                  handleChange("permenantAddress", value)
                }
                disabled={sameAsResidential}
              />
              {errors.permenantAddress && (
                <p className="text-sm text-red-500">
                  {errors.permenantAddress}
                </p>
              )}


              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={sameAsResidential}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSameAsResidential(checked);

                    setFilledEnquiryData((prev) => ({
                      ...prev,
                      permenantAddress: checked ? prev.residentialAddress : "",
                    }));
                  }}
                />
                <span className="text-sm">Same as Residential Address</span>
              </div>
            </div>

            {/* Stationary Kit Type */}
            <ComponentCard title="Kit Details">
              <div className="flex gap-6">

                {/* ID Card */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filledEnquiryData.idCard}
                    onChange={(e) =>
                      setFilledEnquiryData((prev) => ({
                        ...prev,
                        idCard: e.target.checked,
                      }))
                    }
                  />
                  ID Card Issued
                </label>

                {/* Bag */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filledEnquiryData.bag}
                    onChange={(e) =>
                      setFilledEnquiryData((prev) => ({
                        ...prev,
                        bag: e.target.checked,
                      }))
                    }
                  />
                  Bag Issued
                </label>

              </div>
            </ComponentCard>



            <div
              ref={(el) => {
                inputRefs.current.referedBy = el; // ✅ different key
              }}
            >
              <Label>Reference Name</Label>
              <Input
                type="text"
                tabIndex={2}

                placeholder="Enter Reference"
                value={titleCase(newEnquiry.referedBy)}
                onChange={(e) => handleChangeNew("referedBy", e.target.value)}
              />
              {errors.referedBy && (
                <p className="text-sm text-red-500">{errors.referedBy}</p>
              )}
            </div>

            <div ref={(el) => {
              inputRefs.current.admissionDate = el; // ✅ different key
            }}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Admission Date
              </label>
              <Input
                tabIndex={16}
                type="datetime-local"
                placeholder="Enter Admission Date"
                value={filledEnquiryData.admissionDate}
                onChange={(e) => handleChange("admissionDate", e.target.value)}
              />
              {errors.admissionDate && (
                <p className="text-sm text-red-500">{errors.admissionDate}</p>
              )}
            </div>

            <div>
              <DropzonBoxComponent
                tabIndex={17}
                title="Student Photo"
                selectedFile={selectedProfilePicture}
                setSelectedFile={setSelectedProfilePicture}
              />
              {errors.selectedProfilePicture && (
                <p className="text-sm text-red-500">
                  {errors.selectedProfilePicture}
                </p>
              )}
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" tabIndex={19}>
                Clear
              </Button>
              <Button size="sm" tabIndex={18} variant="primary" className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" onClick={handleSubmit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}