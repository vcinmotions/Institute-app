"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronDownIcon, EnvelopeIcon } from "@/icons";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";
import { useDispatch, useSelector } from "react-redux";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";
import { setCourses } from "@/store/slices/courseSlice";
import { RootState } from "@/store";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Select from "@/components/form/Select";
import DropzonBoxComponent from "@/components/form/form-elements/DropBox";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams } from "next/navigation";
import { useFetchEnquiryById } from "@/hooks/useQueryFetchEnquiry";
import { setBatches } from "@/store/slices/batchSlice";
import MultiSelect from "@/components/form/MultiSelect";
import { useFetchAllBatches } from "@/hooks/useQueryFetchBatchData";
import { capitalizeWords } from "@/components/common/ToCapitalize";

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
  address: string;
  admissionDate: any;

  gender: string;
  dob: string;
  facultyId: string;
  residentialAddress: string;
  permenantAddress: string;
  parentsContact: string;
  fatherName: string;
  motherName: string;
  religion: string;
}

interface NewEnquiryDataAll {
  name: string;
  email: string;
  courseId: string[];
  contact: string;
  idProofType: string;
  idProofNumber: string;
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
  motherName: string;
  religion: string;
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

  const [courseRows, setCourseRows] = useState([
    {
      courseId: "",
      paymentType: "",
      installmentTypeId: "",
      feeAmount: "",
      batchId: "",
    },
  ]);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <p>Invalid admission</p>;

  const courses = useSelector((state: RootState) => state.course.courses);
  console.log("get Courses data in admission form:", courses);

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
    address: "",
    admissionDate: "",

    gender: "",
    residentialAddress: "",
    permenantAddress: "",
    parentsContact: "",
    fatherName: "",
    motherName: "",
    dob: "",
    religion: "",

    facultyId: "",
  });

  console.log("Filled Data at Start of initialioze:", filledEnquiryData);

  const router = useRouter();
  const { id: enquiryId } = useParams();
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

  const inputRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [errors, setErrors] = useState<Partial<NewEnquiryDataAll>>({});
  const [paymentTypeOption, setpaymentTypeOption] = useState<any>([]);
  const [installmentTypeOption, setInstallmentTypeOption] = useState<any>([]);
  const { mutate: createAdmission } = useCreateAdmission();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const [batchList, setBatchList] = useState([]);
  console.log("useEffect triggered — enquiryData:", enquiryData);

  console.log("GET ID BY PARAMS IN URL:", enquiryId);
  console.log("courseRows:", courseRows);

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
    }));

    setCourseRows(rows);
  }, [newEnquiry.courseId]);

  const handleCourseRowChange = (index: number, field: string, value: any) => {
    setCourseRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      const row = updated[index];

      // Find selected course
      const selectedCourse = courses.find(
        (c) => c.id.toString() === row.courseId,
      );

      const installmentTypes =
        selectedCourse?.courseFeeStructure?.installments || [];

      // Update feeAmount for ONE_TIME
      if (field === "paymentType" && value === "ONE_TIME") {
        updated[index].feeAmount =
          selectedCourse?.courseFeeStructure?.totalAmount?.toString() || "";
      }

      // Reset fee + installment if switching paymentType
      if (field === "paymentType" && value !== "INSTALLMENT") {
        updated[index].installmentTypeId = "";
      }

      // Update feeAmount for INSTALLMENT
      if (field === "installmentTypeId") {
        const selectedInstallment = installmentTypes.find(
          (i: any) => i.id.toString() === value.toString(),
        );

        updated[index].feeAmount = selectedInstallment
          ? selectedInstallment.amount.toString()
          : "";
      }

      return updated;
    });
  };

  console.log("GET ENQUIRYDATA FRON USEEFFECT:", enquiryData);
  console.log("GET ENQUIRYDATA FRON USEEFFECT:", data);

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

      setFilledEnquiryData((prev) => ({
        ...prev,
        dob: dobValue,
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
    console.log("🎯 enquiryData changed:", enquiryData);
  }, [enquiryData, data]);

  console.log("GET newEnquiry FRON USEEFFECT:", newEnquiry);

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

  const handlePhoneNumberChange = (
    field: "contact" | "parentsContact",
    phoneNumber: string,
    countryCode = "+91"
  ) => {
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      formattedNumber = countryCode + phoneNumber.replace(/^0+/, "");
    }

    if (field === "contact") {
      setNewEnquiry((prev) => ({
        ...prev,
        contact: formattedNumber,
      }));
      setErrors((prev) => ({ ...prev, contact: "" }));
    } else {
      setFilledEnquiryData((prev) => ({
        ...prev,
        parentsContact: formattedNumber,
      }));
      setErrors((prev) => ({ ...prev, parentsContact: "" }));
    }
  };

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchCourse();

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches({ onlyAvailable: true });

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    };
  }, [courseData, dispatch]);


  useEffect(() => {
    console.log("get all batches data;", batchData);
    if (batchData?.batch) { 
      dispatch(setBatches(batchData.batch));
    };
  }, [batchData, dispatch, id]);
  console.log("get all batches data::::::::::::::::::::::::::::::::::::::::::::::::;", batchData);

  const courseList = useSelector((state: RootState) => state.course.courses);
  const batch = useSelector((state: RootState) => state.batch.batches);

  console.log("useEffect triggered — batch:", batch);

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${capitalizeWords(b.name)} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

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

    if (!newEnquiry.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEnquiry.email))
      newErrors.email = "Please enter a valid email address.";

    if (!newEnquiry.contact.trim())
      newErrors.contact = "Contact number is required.";
    // else if (!/^\+\d{10,15}$/.test(newEnquiry.contact))
    //   newErrors.contact = "Enter a valid phone number with country code.";

    if (!newEnquiry.courseId) newErrors.courseId = "Please select a course.";

    // 🔹 Extended Admission Details
    if (!filledEnquiryData.fatherName.trim())
      newErrors.fatherName = "Father's name is required.";
    if (!filledEnquiryData.motherName.trim())
      newErrors.motherName = "Mother's name is required.";
    if (!filledEnquiryData.gender.trim())
      newErrors.gender = "Gender is required.";

    if (!filledEnquiryData.dob.trim())
      newErrors.dob = "Date of birth is required.";
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(filledEnquiryData.dob))
      newErrors.dob = "Date of birth must be in DD/MM/YYYY format.";

    if (!filledEnquiryData.idProofType.trim())
      newErrors.idProofType = "Select an ID proof type.";
    if (!filledEnquiryData.idProofNumber.trim())
      newErrors.idProofNumber = "ID proof number is required.";

    if (!filledEnquiryData.residentialAddress.trim())
      newErrors.residentialAddress = "Residential address is required.";

    if (!filledEnquiryData.permenantAddress.trim())
      newErrors.permenantAddress = "Permanent address is required.";

    if (!filledEnquiryData.parentsContact.trim())
      newErrors.parentsContact = "Parent's contact number is required.";
    // else if (!/^\+\d{10,15}$/.test(filledEnquiryData.parentsContact))
    //   newErrors.parentsContact =
    //     "Enter a valid parent's phone number with country code.";

    if (!filledEnquiryData.religion.trim())
      newErrors.religion = "Religion is required.";

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
    if (
      filledEnquiryData.idProofType === "aadhar card" &&
      !/^\d{12}$/.test(filledEnquiryData.idProofNumber)
    )
      newErrors.idProofNumber = "Aadhar must be 12 digits.";

    if (!selectedProfilePicture)
      newErrors.selectedProfilePicture = "Profiloe Picture is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 3000);

    return Object.keys(newErrors).length === 0;
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

  const handleRowChange = (index: number, field: string, value: any) => {
    setCourseRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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

  const handleChangeNewNew = (field: keyof EnquiryData, value: string) => {
    console.log("Filled Data NOW:", filledEnquiryData);

    console.log("Field and value in handleChange New:", field, value);

    setNewEnquiry((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log("Filled Data NOW:", filledEnquiryData); // ✔ correct place

    if (field === "courseId") {
      const selectedCourse = courses.find((c) => c.id.toString() === value);

      console.log("Selected Course:", selectedCourse);

      // ✅ Always set Fee + Payment Type if courseFeeStructure exists
      if (selectedCourse?.courseFeeStructure) {
        setpaymentTypeOption(selectedCourse.courseFeeStructure.paymentType);
        setFilledEnquiryData((prev) => ({
          ...prev,

          feeAmount: installmentTypeOption.amount?.toString() || "",

          //paymentType: selectedCourse.courseFeeStructure.paymentType || "",
        }));
      }
    }

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  console.log("GET BATCH LIST DETAILS:", batchList);
  console.log("GET BATCH LIST DETAILS:", batchOptions);

  const handleSubmit = async () => {
    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please enter all inputs.",
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

    // Combine all data
    const admissionPayload = {
      token,
      id: newEnquiry.id,
      name: newEnquiry.name,
      email: newEnquiry.email,
      contact: newEnquiry.contact,
      facultyId: filledEnquiryData.facultyId,

      courseData: courseRows,
      idProofType: filledEnquiryData.idProofType,
      idProofNumber: filledEnquiryData.idProofNumber,
      address: filledEnquiryData.address,
      admissionDate: filledEnquiryData.admissionDate,

      gender: filledEnquiryData.gender,
      residentialAddress: filledEnquiryData.residentialAddress,
      permenantAddress: filledEnquiryData.permenantAddress,
      parentsContact: filledEnquiryData.parentsContact,
      fatherName: filledEnquiryData.fatherName,
      motherName: filledEnquiryData.motherName,
      dob: filledEnquiryData.dob,
      religion: filledEnquiryData.religion,

      profilePicture: selectedProfilePicture, // you'll need to track this in state
    };

    try {
      await createAdmission(admissionPayload);
      // reset form and show success alert as before
      // Wait 3 seconds before showing alert
      setAlert({
        show: true,
        title: "Admission Successful",
        message: "Student admission has been successfully submitted.",
        variant: "success",
      });

      window.scrollTo({
        top: 0, behavior: "smooth"
      })

      // Close modal after showing alert for 2 seconds (for example)
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      // handle error
    }
  };

  console.log("get All Admission form data:", newEnquiry);
  console.log("get All Admission form editable data:", filledEnquiryData);
  console.log("get All Admission form Course data:", courseRows);
  console.log("get All PAYMENT TYPE OPTIONS::", paymentTypeOption);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Student Admission" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6 dark:text-gray-50 dark:border-gray-700">Student Infomation</h2>

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
                placeholder="Enter Student Name"
                value={newEnquiry.name}
                className="capitalize"
                onChange={(e) => handleChangeNew("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
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
                className="capitalize"
                placeholder="Enter Father Name"
                value={filledEnquiryData.fatherName}
                onChange={(e) => handleChange("fatherName", e.target.value)}
              />
              {errors.fatherName && (
                <p className="text-sm text-red-500">{errors.fatherName}</p>
              )}
            </div>
            <div
              ref={(el) => {
                inputRefs.current["motherName"] = el;
              }}
            >
              <Label>Mother's Name</Label>
              <Input
                type="text"
                tabIndex={3}
                className="capitalize"
                placeholder="Enter Mother Name"
                value={filledEnquiryData.motherName}
                onChange={(e) => handleChange("motherName", e.target.value)}
              />
              {errors.motherName && (
                <p className="text-sm text-red-500">{errors.motherName}</p>
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
            <div>
              <Label>Student Contact</Label>
              <PhoneInput
                tabIndex={5}
                selectPosition="start"
                countries={countries}
                placeholder="Enter Student Contact"
                value={stripCountryCode(newEnquiry.contact)} // 👈 IMPORTANT
                onChange={(value) => handlePhoneNumberChange("contact", value)}
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
                value={stripCountryCode(filledEnquiryData.parentsContact)} // 👈 IMPORTANT
                placeholder="Enter Alternate Contact no."
                onChange={(value) => handlePhoneNumberChange("parentsContact", value)}
              />
              {errors.parentsContact && (
                <p className="text-sm text-red-500">{errors.parentsContact}</p>
              )}
            </div>{" "}
            <div>
              <Label>Date Of Birth</Label>
              <Input
                tabIndex={7}
                type="text"
                placeholder="Enter DOB"
                //maxLength={10} // e.g. 12:30 PM
                value={filledEnquiryData.dob}
                onChange={(e) => handleDateChange("dob", e.target.value)}
              />
              {errors.dob && (
                <p className="text-sm text-red-500">{errors.dob}</p>
              )}
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
            <div>
              <Label>Religion</Label>
              <Input
                tabIndex={9}
                type="text"
                className="capitalize"
                placeholder="Enter Student Religion"
                value={filledEnquiryData.religion}
                onChange={(e) => handleChange("religion", e.target.value)}
              />
              {errors.religion && (
                <p className="text-sm text-red-500">{errors.religion}</p>
              )}
            </div>
            {/* Select Course */}
            <div>
              <div className="relative" data-master="course">
                <MultiSelect
                  tabIndex={10}
                  options={courseList.map((course) => ({
                    value: String(course.id),
                    text: capitalizeWords(course.name),
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
                <div
                  key={index}
                  className="mb-4 rounded-xl border dark:border-gray-500 bg-gray-50 p-4 dark:bg-white/3"
                >
                  <h3 className="mb-3 font-semibold dark:text-gray-300">
                    Course #{index + 1}: {selectedCourse?.name}
                  </h3>

                  {/* Payment Type */}
                  <div>
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
                </div>
              );
            })}
            <div>
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
                placeholder="Enter Id No."
                onChange={(e) => handleChange("idProofNumber", e.target.value)}
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
                placeholder="Enter Student Residential Address"
                value={filledEnquiryData.residentialAddress}
                onChange={(e) =>
                  handleChange("residentialAddress", e.target.value)
                }
              />
              {errors.residentialAddress && (
                <p className="text-sm text-red-500">
                  {errors.residentialAddress}
                </p>
              )}
            </div>
            <div>
              <Label>Permenant Address</Label>

              <Input
                tabIndex={15}
                type="text"
                placeholder="Enter Student Permenant Address"
                value={filledEnquiryData.permenantAddress}
                onChange={(e) =>
                  handleChange("permenantAddress", e.target.value)
                }
              />
              {errors.permenantAddress && (
                <p className="text-sm text-red-500">
                  {errors.permenantAddress}
                </p>
              )}
            </div>
            <div>
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
              <Button size="sm" variant="outline" tabIndex={18}>
                Clear
              </Button>
              <Button size="sm" tabIndex={19} onClick={handleSubmit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
