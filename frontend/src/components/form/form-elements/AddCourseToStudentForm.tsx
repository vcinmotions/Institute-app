"use client";
import React, { useState, useEffect, useRef } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateCourse } from "@/hooks/useCreateCourse";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "@/store/slices/courseSlice";
import { RootState } from "@/store";

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
  batch,
  course,
}: DefaultInputsProps) {
  console.log("get Student Id is Add course Form:", studentId);
  console.log("get Batch is Add course Form:", batch);
  console.log("get course is Add course Form:", course);

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
  const { mutate: createCourse } = useCreateCourse();
  const { mutateAsync: createCourseMutation } = useCreateCourse();
  const countries = [
    { code: "IN", label: "+91" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  console.log("useEffect triggered — studentDetails:", studentDetails);

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

  const enrolledCourseIds =
    studentDetails?.studentCourses?.map(
      (sc: { courseId: any }) => sc.courseId,
    ) || [];
  const enrolledBatchIds =
    studentDetails?.studentCourses?.map((sc: { batchId: any }) => sc.batchId) ||
    [];

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

  // Filter batches to remove those with same time ranges
  // const filteredBatches = batch.filter((b) => {
  //   const timeRange = `${b.labTimeSlot.startTime}-${b.labTimeSlot.endTime}`;
  //   return !enrolledTimeRanges.includes(timeRange);
  // });

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

  const filteredBatches = batch.filter((b) => !enrolledBatchIds.includes(b.id));
  // Filter batches to remove those with same time ranges
  const filteredTimeSlots = batch.filter((b) => {
    const timeRange = `${b.labTimeSlot.startTime}-${b.labTimeSlot.endTime}`;
    return !enrolledTimeRanges.includes(timeRange);
  });

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

    setTimeout(() => setErrors({}), 3000);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NewCourseData, value: string) => {
    setFilledCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // if (field === "courseId") {
    //   const selectedCourse = courseList.find((c) => c.id.toString() === value);

    //   console.log("Selected Course:", selectedCourse);

    //   // ✅ Always set Fee + Payment Type if courseFeeStructure exists
    //   if (selectedCourse?.courseFeeStructure) {
    //     setpaymentTypeOption(selectedCourse.courseFeeStructure.paymentType);
    //     setFilledCourseData((prev) => ({
    //       ...prev,

    //       feeAmount: installmentTypeOption.amount?.toString() || "",
    //     }));
    //   }
    // }

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

    // if (field === "course") {
    //   const selectedCourse = courses.find(c => c.id.toString() === value);
    //   if (selectedCourse?.batches) {
    //     setBatchList(selectedCourse.batches.map((b: any) => ({
    //       value: b.id.toString(),
    //       label: `${b.name} (${b.startTime} - ${b.endTime})`,
    //     })));
    //   } else {
    //     setBatchList([]);
    //   }
    //   setFilledEnquiryData(prev => ({ ...prev, batch: "" }));
    // }

    // if (field === "courseId") {
    //   const selectedCourse = courseList.find((c) => c.id.toString() === value);

    //   // ✅ Auto Update Fee & Payment Type if courseFeeStructure is available
    //   if (selectedCourse?.courseFeeStructure) {
    //     setFilledCourseData((prev) => ({
    //       ...prev,
    //       feeAmount:
    //         selectedCourse.courseFeeStructure.totalAmount?.toString() || "",
    //       paymentType: selectedCourse.courseFeeStructure.paymentType || "",
    //     }));
    //   }
    // }

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

    try {
      await createCourseMutation(admissionPayload);

      setAlert({
        show: true,
        title: "Course Assigned",
        message: "Student course was successfully created.",
        variant: "success",
      });

      // optional: close modal
      setTimeout(() => onCloseModal(), 2000);
    } catch (error: any) {
      console.error("Error creating course:", error);
      setAlert({
        show: true,
        title: "Failed to Assign Course",
        message:
          error?.response?.data?.error ||
          "Something went wrong. Please try again.",
        variant: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, title: "", message: "", variant: "" });
        onCloseModal();
      }, 2000);
    }
  };

  console.log(
    "get All Add New Course To Existing Student form editable data:",
    filledCoursedata,
  );

  return (
    <ModalCard title="Course Form" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.title === "Course Assigned" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        <div>
          <Label>Select Course</Label>
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
              defaultValue={filledCoursedata.courseId} // Bind selected course
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.courseId && (
            <p className="text-sm text-red-500">{errors.courseId}</p>
          )}
        </div>

        <div>
          <Label>Select Batch</Label>
          <div className="relative" data-master="batch">
            <Select
              tabIndex={2}
              options={filteredTimeSlots.map((batch) => ({
                label: batch.name,
                value: batch.id,
              }))}
              placeholder="Select an option"
              onChange={(value) => handleChange("batchId", value)}
              defaultValue={filledCoursedata.batchId} // Bind selected course
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.batchId && (
            <p className="text-sm text-red-500">{errors.batchId}</p>
          )}
        </div>

        {/* <div>
          <Label>Payment Type</Label>
          <Input
            tabIndex={4}
            type="text"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledCoursedata.paymentType}
            onChange={(e) => handleChange("paymentType", e.target.value)}
          />
          {errors.paymentType && (
            <p className="text-sm text-red-500">{errors.paymentType}</p>
          )}
        </div> */}

        <div>
          <Label>Select Payment Type</Label>
          <div className="relative" data-master="course">
            <Select
              tabIndex={10}
              options={paymentTypeOption.map((course: any) => ({
                label: course,
                value: course,
              }))}
              placeholder="Select a course"
              onChange={(value) => handleChange("paymentType", value)}
              value={filledCoursedata.paymentType} // just the courseId string
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.paymentType && (
            <p className="text-sm text-red-500">{errors.paymentType}</p>
          )}
        </div>
        {filledCoursedata.paymentType === "INSTALLMENT" &&
          installmentTypeOption.length > 0 && (
            <div>
              <Label>Select Installment Type</Label>
              <div className="relative" data-master="course">
                <Select
                  tabIndex={10}
                  options={installmentTypeOption.map(
                    (ins: { id: number; number: any; amount: any }) => ({
                      label: `${ins.number} Installments - ₹${ins.amount}`,
                      value: ins.id, // <-- important
                    }),
                  )}
                  placeholder="Select a course"
                  onChange={(value) => handleChange("installmentTypeId", value)}
                  value={filledCoursedata.installmentTypeId} // just the courseId string
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
              {errors.installmentTypeId && (
                <p className="text-sm text-red-500">
                  {errors.installmentTypeId}
                </p>
              )}
            </div>
          )}

        <div>
          <Label>Fee Amount</Label>
          <Input
            tabIndex={3}
            type="text"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledCoursedata.feeAmount}
            readOnly
          />
          {errors.feeAmount && (
            <p className="text-sm text-red-500">{errors.feeAmount}</p>
          )}
        </div>

        {/* <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Admission Date
          </label>
          <Input
            tabIndex={5}
            type="text"
            placeholder="10/10/2025"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
            value={filledCoursedata.admissionDate}
            onChange={(e) => handleDateChange("admissionDate", e.target.value)}
          />
          {errors.admissionDate && (
            <p className="text-sm text-red-500">{errors.admissionDate}</p>
          )}
        </div> */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Admission Date
          </label>
          <Input
            tabIndex={5}
            type="datetime-local"
            placeholder="Ex. Mumbai, Maharashtra"
            value={filledCoursedata.admissionDate}
            onChange={(e) => handleChange("admissionDate", e.target.value)}
          />
          {errors.admissionDate && (
            <p className="text-sm text-red-500">{errors.admissionDate}</p>
          )}
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={6}
            onClick={onCloseModal}
          >
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
