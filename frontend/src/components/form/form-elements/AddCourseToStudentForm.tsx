"use client";

import React, { useState, useEffect, useRef } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCourseToExistenceStudent } from "@/hooks/useAssignCurseToExistemceStudent";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import { RootState } from "@/store";
import { setBatches } from "@/store/slices/batchSlice";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { capitalizeWords } from "@/components/common/ToCapitalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

interface DefaultInputsProps {
  onCloseModal: () => void;
  studentId: string;
  batch: any[];
  course: any[];
  studentDetails: any;
}

interface NewCourseData {
  courseId: string;
  batchId: string;
  admissionDate: any;
  feeAmount: string;
  paymentType: string;
  installmentTypeId: string;
}

export default function CourseForm({
  onCloseModal,
  studentId,
  studentDetails,
  course,
}: DefaultInputsProps) {
  console.log("get Student Id is Add course Form:", studentId);
  console.log("get course is Add course Form:", course);

  const batch = useSelector((state: RootState) => state.batch.batches);
  const [filledCoursedata, setFilledCourseData] = useState<NewCourseData>({
    courseId: "",
    batchId: "",
    admissionDate: "",
    feeAmount: "",
    paymentType: "",
    installmentTypeId: "",
  });
  const dispatch = useDispatch();
  const [facultyList, setFacultyList] = useState([]);
  const { inputRefs, scrollToError } = useScrollToError();

  const [batchList, setBatchList] = useState([]);

  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);

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

  const [errors, setErrors] = useState<Partial<NewCourseData>>({});
  const { mutateAsync: assignCourseToExistenceStudent } = useCourseToExistenceStudent();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  console.log("useEffect triggered — studentDetails:", studentDetails);

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches({ onlyAvailable: true });

  const [paymentTypeOption, setpaymentTypeOption] = useState<any>([]);
  const [installmentTypeOption, setInstallmentTypeOption] = useState<any>([]);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchCourse();

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  const courseList = useSelector((state: RootState) => state.course.courses);

  console.log("Get Courses Name in Add course to student Form:", courseList);

  useEffect(() => {
    console.log("get all batches data;", batchData);
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch));
    }
    setBatches;
  }, [batchData, dispatch]);
  console.log("get all batches data::::::::::::::::::::::::::::::::::::::::::::::::;", batchData);

  const enrolledCourseIds =
    studentDetails?.studentCourses?.map(
      (sc: { courseId: any }) => sc.courseId,
    ) || [];
  const enrolledBatchIds =
    studentDetails?.studentCourses?.map((sc: { batchId: any }) => sc.batchId) ||
    [];

  const batchOptions = batch.map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  console.log(
    "Get ENROLLED COURseID in Add course to student Form:",
    enrolledCourseIds,
  );
  console.log(
    "Get ENROLLED BATCHID in Add course to student Form:",
    enrolledBatchIds,
  );

  // Get already assigned time slots (start + end) for this student
  const enrolledTimeRanges =
    studentDetails?.labAllocations
      .map((la: any) => {
        // find the labTimeSlot object for this allocation
        const slot = batch.find(
          (b) => b.labTimeSlotId === la.labTimeSlotId,
        )?.labTimeSlot;
        return slot ? `${slot.startTime}-${slot.endTime}` : null;
      })
      .filter(Boolean) || [];

  const enrolledTimeSlot =
    studentDetails?.labAllocations.map(
      (sc: { labTimeSlotId: any }) => sc.labTimeSlotId,
    ) || [];

  console.log(
    "Get ENROLLED TIMESLOTID in Add course to student Form:",
    enrolledTimeSlot,
  );

  console.log(
    "Get ENROLLED TIMESLOTID RANGE in Add course to student Form:",
    enrolledTimeRanges,
  );

  const filteredCourses = courseList.filter(
    (course) => !enrolledCourseIds.includes(course.id),
  );

  console.log("enrolledCourseIds:", enrolledCourseIds);
  console.log("FILTERED COURSE:", filteredCourses);

  const filteredBatches = batch.filter((b) => !enrolledBatchIds.includes(b.id)).map((b: any) => ({
    value: b.id.toString(),
    label: `${b.name} | ${b.labTimeSlot.startTime} - ${b.labTimeSlot.endTime} | PCs: ${b.labTimeSlot.availablePCs}`,
  }));

  // Filter batches to remove those with same time ranges
  const filteredTimeSlots = batch.filter((b) => {
    const timeRange = `${b.labTimeSlot.startTime}-${b.labTimeSlot.endTime}`;
    return !enrolledTimeRanges.includes(timeRange);
  });

  console.log("GET filteredBatches in Add course form;", filteredBatches);
  console.log("GET FilteredTimeSots in Add course form;", filteredTimeSlots);

  const validate = () => {
    const newErrors: Partial<NewCourseData> = {};

    if (!filledCoursedata.courseId) newErrors.courseId = "Course is required.";
    if (!filledCoursedata.batchId) newErrors.batchId = "Batch is required.";
    if (!filledCoursedata.feeAmount)
      newErrors.feeAmount = "Fee amount is required.";
    if (!filledCoursedata.paymentType)
      newErrors.paymentType = "Payment type is required.";
    if (!filledCoursedata.admissionDate)
      newErrors.admissionDate = "Admission date is required.";

    setErrors(newErrors);
    setTimeout(() => setErrors({}), 2000);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleChange = (field: keyof NewCourseData, value: string) => {
    setFilledCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "courseId") {
      const selectedCourse = courseList.find((c) => c.id.toString() === value);

      if (selectedCourse?.courseFeeStructure) {
        const fee = selectedCourse.courseFeeStructure.totalAmount;
        const paymentTypes = selectedCourse.courseFeeStructure.paymentType;
        const installments = selectedCourse.courseFeeStructure.installments;

        // ✅ Set payment type dropdown options
        setpaymentTypeOption(paymentTypes || []);

        console.log("GET SELECTED PAYMENTTUPE :", paymentTypeOption);

        // ✅ Set installment dropdown options
        setInstallmentTypeOption(installments || []);

        // ✅ Auto-set default fee
        setFilledCourseData((prev) => ({
          ...prev,
          feeAmount: fee?.toString() || "",
          paymentType: "", // payment type unselected until user chooses
          installmentTypeId: "", // clear installment
        }));
      }
    }

    if (field === "installmentTypeId") {
      const selectedIns = installmentTypeOption.find(
        (ins: any) => ins.id.toString() === value,
      );

      if (selectedIns) {
        setFilledCourseData((prev) => ({
          ...prev,
          feeAmount: selectedIns.amount.toString(), // AUTO SET FEE
        }));
      }
    }

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleDateChange = (field: keyof NewCourseData, value: string) => {
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
    setFilledCourseData((prev) => ({
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

  const handleChangeNew = (field: keyof NewCourseData, value: string) => {
    setFilledCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "courseId") {
      const selectedCourse = courseList.find((c) => c.id.toString() === value);

      if (selectedCourse?.courseFeeStructure) {
        const fee = selectedCourse.courseFeeStructure.totalAmount;
        const paymentTypes = selectedCourse.courseFeeStructure.paymentType;
        const installments = selectedCourse.courseFeeStructure.installments;

        // ✅ Set payment type dropdown options
        setpaymentTypeOption(paymentTypes || []);

        console.log("GET SELECTED PAYMENTTUPE :", paymentTypeOption);

        // ✅ Set installment dropdown options
        setInstallmentTypeOption(installments || []);

        // ✅ Auto-set default fee
        setFilledCourseData((prev) => ({
          ...prev,
          feeAmount: fee?.toString() || "",
          paymentType: "", // payment type unselected until user chooses
          installmentTypeId: "", // clear installment
        }));
      }
    }

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  console.log("GET SELECTED PAYMENTTUPE :", paymentTypeOption);

  const handleSubmit = async () => {
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

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
      }, 3000);

      return;
    }

    const admissionPayload = {
      token,
      studentId,
      courseId: filledCoursedata.courseId,
      batchId: filledCoursedata.batchId,
      admissionDate: filledCoursedata.admissionDate,
      feeAmount: filledCoursedata.feeAmount,
      paymentType: filledCoursedata.paymentType,
      installmentTypeId: filledCoursedata.installmentTypeId,
    };

    assignCourseToExistenceStudent(
      admissionPayload,
      {
        onSuccess: () => {
          setFilledCourseData({
            courseId: "",
            batchId: "",
            admissionDate: "",
            feeAmount: "",
            paymentType: "",
            installmentTypeId: "",
          });

          setAlert({
            show: true,
            title: "Course Assigned",
            message: "New Course has been successfully Assigned.",
            variant: "success",
          });

          window.scrollTo({
            top: 0, behavior: "smooth"
          })

          setTimeout(() => {
            onCloseModal();
          }, 1000);
        },

        onError: () => {
          // You already handle error via redux + toast
          window.scrollTo({
            top: 0, behavior: "smooth"
          })
        },
      },
    );
  };

  console.log(
    "get All Add New Course To Existing Student form editable data:",
    filledCoursedata,
  );

  return (
    <ModalCard title="Course Form" oncloseModal={onCloseModal}>
      <div className="flex flex-col gap-6">

        {/* Alert Messages */}
        {alert.show && (
          <Alert
            variant={alert.title === "Course Assigned" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* Form Groupings */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Enrollment Details
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Course Selection */}
            <div>
              <Label>Select Course *</Label>
              <div className="relative" data-master="course">
                <Select
                  ref={firstInputRef}
                  tabIndex={1}
                  options={filteredCourses.map((course) => ({
                    label: course.name,
                    value: course.id,
                  }))}
                  placeholder="Select a course"
                  onChange={(value) => handleChangeNew("courseId", value)}
                  defaultValue={filledCoursedata.courseId}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.courseId && (
                <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>
              )}
            </div>

            {/* Batch Selection */}
            <div>
              <Label>Select Batch *</Label>
              <div className="relative" data-master="batch">
                <Select
                  tabIndex={2}
                  options={filteredBatches.map((batch) => ({
                    label: batch.label,
                    value: batch.value,
                  }))}
                  placeholder="Select a batch"
                  onChange={(value) => handleChange("batchId", value)}
                  defaultValue={filledCoursedata.batchId}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.batchId && (
                <p className="mt-1 text-sm text-red-500">{errors.batchId}</p>
              )}
            </div>

            {/* Admission Date */}
            <div>
              <Label>Admission Date *</Label>
              <Input
                tabIndex={5}
                type="datetime-local"
                value={filledCoursedata.admissionDate}
                onChange={(e) => handleChange("admissionDate", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {errors.admissionDate && (
                <p className="mt-1 text-sm text-red-500">{errors.admissionDate}</p>
              )}
            </div>

            {/* Payment Type */}
            <div>
              <Label>Select Payment Type *</Label>
              <div className="relative" data-master="payment">
                <Select
                  tabIndex={10}
                  options={paymentTypeOption.map((course: any) => ({
                    label: course,
                    value: course,
                  }))}
                  placeholder="Select payment type"
                  onChange={(value) => handleChange("paymentType", value)}
                  value={filledCoursedata.paymentType}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.paymentType && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentType}</p>
              )}
            </div>

            {/* Conditional Installment Type */}
            {filledCoursedata.paymentType === "INSTALLMENT" &&
              installmentTypeOption.length > 0 && (
                <div>
                  <Label>Select Installment Type *</Label>
                  <div className="relative" data-master="installment">
                    <Select
                      tabIndex={11}
                      options={installmentTypeOption.map(
                        (ins: { id: number; number: any; amount: any }) => ({
                          label: `${ins.number} Installments - ₹${ins.amount}`,
                          value: ins.id,
                        })
                      )}
                      placeholder="Select installment plan"
                      onChange={(value) => handleChange("installmentTypeId", value)}
                      value={filledCoursedata.installmentTypeId}
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {errors.installmentTypeId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.installmentTypeId}
                    </p>
                  )}
                </div>
              )}

            {/* Fee Amount (Readonly) */}
            <div>
              <Label>Fee Amount</Label>
              <Input
                tabIndex={3}
                type="text"
                placeholder="₹ 0.00"
                value={filledCoursedata.feeAmount}
                readOnly
                className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed focus:ring-0"
              />
              {errors.feeAmount && (
                <p className="mt-1 text-sm text-red-500">{errors.feeAmount}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            tabIndex={6}
            onClick={onCloseModal}
            className="min-w-[100px] rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            Close
          </Button>
          <Button
            size="sm"
            variant="primary"
            tabIndex={7}
            onClick={handleSubmit}
            className="min-w-[120px] rounded bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            Save Course
          </Button>
        </div>

      </div>
    </ModalCard>
  );
}