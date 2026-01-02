"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon } from "../../../icons";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useEditCourse } from "@/hooks/useEditCourse";
import Checkbox from "../input/Checkbox";

interface DefaultInputsProps {
  onCloseModal: () => void;
  batchData: CourseData;
}
interface CourseData {
  id: string;
  description: string;
  durationWeeks: string;
  name: string;
  paymentType: any; // should ideally be string[]
  totalAmount: string;

  installments?: InstallmentDetail[]; // FIXED (matches the UI not backend)

  courseFeeStructure?: {
    paymentType: any[];
    totalAmount: string;
    installments?: {
      number: number;
      amount: number;
    }[]; // ✅ FIXED
  };
}

interface InstallmentDetail {
  installment: string;
  addAmount: string;
}

export default function EditCourseForm({
  onCloseModal,
  batchData,
}: DefaultInputsProps) {
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: "",
    name: "",
    description: "",
    durationWeeks: "",
    paymentType: "",
    totalAmount: "",
    installments: [],
  });

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

  console.log("GET BATCH DATA IN EDIT COURSE FORM:", batchData);

  // Installments State (Array)
  const [installments, setInstallments] = useState<InstallmentDetail[]>([
    { installment: "2", addAmount: "" },
  ]);
  const [errors, setErrors] = useState<Partial<CourseData>>({});
  const [oneTime, setOneTime] = useState<boolean>(false);
  const [installment, setInstallment] = useState<boolean>(false);
  const { mutate: editCourse } = useEditCourse();
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

  const validate = () => {
    const newErrors: Partial<CourseData> = {};

    if (!newCourse.durationWeeks.trim()) {
      newErrors.durationWeeks = "Name is required.";
    }

    if (!newCourse.name.trim()) {
      newErrors.name = "Course is required.";
    }

    if (!newCourse.totalAmount.trim()) {
      newErrors.totalAmount = "totalAmount is required.";
    }

    if (!newCourse.paymentType) {
      newErrors.paymentType = "paymentType is required.";
    }

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };

  // useEffect(() => {
  //   if (batchData) {
  //     setNewCourse({
  //       id: batchData.id || "",
  //       description: batchData.description || "",
  //       durationWeeks: batchData.durationWeeks?.toString() || "",
  //       name: batchData.name || "",
  //       paymentType: batchData?.courseFeeStructure?.paymentType || "",
  //       totalAmount:
  //         batchData?.courseFeeStructure?.totalAmount?.toString() || "",
  //     });
  //   }
  // }, [batchData]);

  useEffect(() => {
    if (!batchData) return;

    // PaymentType (Array)
    const pt = Array.isArray(batchData?.courseFeeStructure?.paymentType)
      ? batchData.courseFeeStructure.paymentType
      : [];

    // Map installments
    const mappedInstallments =
      batchData?.courseFeeStructure?.installments?.map((ins) => ({
        installment: String(ins.number),
        addAmount: String(ins.amount),
      })) || [];

    setNewCourse({
      id: String(batchData.id || ""),
      name: batchData.name || "",
      description: batchData.description || "",
      durationWeeks: String(batchData.durationWeeks || ""),
      totalAmount: String(batchData?.courseFeeStructure?.totalAmount || ""),
      paymentType: pt,
      installments: mappedInstallments,
    });

    setOneTime(pt.includes("ONE_TIME"));
    setInstallment(pt.includes("INSTALLMENT"));

    setInstallments(
      mappedInstallments.length > 0
        ? mappedInstallments
        : [{ installment: "1", addAmount: "" }],
    );
  }, [batchData]);

  // const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
  //   // toggle the UI checkboxes
  //   if (value === "ONE_TIME") {
  //     setOneTime((prev) => !prev);
  //   } else {
  //     setInstallment((prev) => !prev);
  //   }

  //   setNewCourse((prev) => {
  //     const updated = [];

  //     const ot = value === "ONE_TIME" ? !oneTime : oneTime;
  //     const inst = value === "INSTALLMENT" ? !installment : installment;

  //     if (ot) updated.push("ONE_TIME");
  //     if (inst) updated.push("INSTALLMENT");

  //     return { ...prev, paymentType: updated };
  //   });
  // };

  const handleTypesCheck = (value: "ONE_TIME" | "INSTALLMENT") => {
    if (value === "ONE_TIME") {
      const newOneTime = !oneTime;
      setOneTime(newOneTime);

      setNewCourse((prev) => {
        let updatedTypes = [];

        if (newOneTime) updatedTypes.push("ONE_TIME");
        if (installment) updatedTypes.push("INSTALLMENT");

        return { ...prev, paymentType: updatedTypes };
      });

      return;
    }

    // ----- INSTALLMENT checkbox toggle -----
    const newInstallment = !installment;
    setInstallment(newInstallment);

    // If INSTALLMENT is unchecked → clear installments
    if (!newInstallment) {
      setInstallments([]); // clear UI installments

      setNewCourse((prev) => ({
        ...prev,
        installments: [], // clear inside form data
        paymentType: oneTime ? ["ONE_TIME"] : [], // keep ONE_TIME if selected
      }));

      return;
    }

    // If INSTALLMENT is checked again → keep existing installments or initialize one
    setInstallments((prev) =>
      prev.length ? prev : [{ installment: "2", addAmount: "" }],
    );

    setNewCourse((prev) => {
      let updatedTypes = [];

      if (oneTime) updatedTypes.push("ONE_TIME");
      updatedTypes.push("INSTALLMENT");

      return {
        ...prev,
        paymentType: updatedTypes,
      };
    });
  };

  // Handle input change
  const updateInstallment = (
    index: number,
    field: keyof InstallmentDetail,
    value: string,
  ) => {
    setInstallments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );

    const updatedInstallments = [...installments];
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    };
    // setNewCourse((prev) => ({
    //   ...prev,
    //   installments: updatedInstallments,
    // }));

    setNewCourse((prev) => ({
      ...prev,
      installments: updatedInstallments.map((i, idx) =>
        idx === index ? { ...i, [field]: value } : i,
      ),
    }));
  };

  // Add new installment
  const addInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      { installment: String(prev.length + 1 + 1), addAmount: "" },
    ]);
  };

  // Remove installment
  // const removeInstallment = (index: number) => {
  //   setInstallments((prev) => prev.filter((_, i) => i !== index));
  // };
  const removeInstallment = (index: number) => {
    // remove selected installment from UI
    const filtered = installments.filter((_, i) => i !== index);

    // If after removing → no installments left
    if (filtered.length === 0) {
      // Reset installments UI
      setInstallments([{ installment: "1", addAmount: "" }]);

      // Reset form
      setNewCourse((prev) => ({
        ...prev,
        paymentType: "", // clear selected payment type
        installments: [], // clear installments from newCourse
        totalAmount: "", // optional reset
      }));

      // Reset checkbox states
      setOneTime(false);
      setInstallment(false);

      return;
    }

    // If still some installments remain
    setInstallments(filtered);

    // Sync newCourse installments
    setNewCourse((prev) => ({
      ...prev,
      installments: filtered,
    }));
  };

  const handleChange = (field: keyof CourseData, value: string) => {
    setNewCourse((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // if payment type changed to ONE_TIME → reset installmentCount

      return updated;
    });

    // clear error for that field
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

    const id = batchData.id;
    console.log("GET LABDATA ID IN HABDLE SUBMIT:", id);

    editCourse(
      { newCourse, id },
      {
        onSuccess: () => {
          setNewCourse({
            id: "",
            description: "",
            durationWeeks: "",
            name: "",
            paymentType: "",
            totalAmount: "",
          });

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
      },
    );
  };

  console.log("GET NEW UPDATED COURSE DATA;", newCourse);

  return (
    <ModalCard title="Edit Course" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.title === "Enquiry Created" ? "success" : "error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        <div>
          <Label>Course</Label>
          <Input
            ref={firstInputRef}
            tabIndex={1}
            type="text"
            placeholder="Ex. Full Stack Developer"
            value={newCourse.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label>Duration Weeks</Label>
          <Input
            type="text"
            tabIndex={2}
            placeholder="12"
            value={newCourse.durationWeeks}
            onChange={(e) => handleChange("durationWeeks", e.target.value)}
          />
          {errors.durationWeeks && (
            <p className="text-sm text-red-500">{errors.durationWeeks}</p>
          )}
        </div>

        <div>
          <Label>Course Amount</Label>
          <Input
            type="text"
            tabIndex={4}
            placeholder="12000"
            value={newCourse.totalAmount}
            onChange={(e) => handleChange("totalAmount", e.target.value)}
          />
          {errors.totalAmount && (
            <p className="text-sm text-red-500">{errors.totalAmount}</p>
          )}
        </div>

        <div>
          <Label> Payment Type *</Label>

          <div className="flex gap-4">
            <Checkbox
              className="h-5 w-5"
              checked={oneTime}
              onChange={(value) => handleTypesCheck("ONE_TIME")}
            />
            <Label> ONE_TIME</Label>

            <Checkbox
              className="h-5 w-5"
              checked={installment}
              onChange={(value) => handleTypesCheck("INSTALLMENT")}
            />
            <Label> INSTALLMENTS</Label>
          </div>
        </div>

        {oneTime === true && (
          <div className="mt-4">
            <Label>One Time Payment</Label>

            <div className="mb-3 flex items-center gap-3">
              <Input
                type="text"
                className="w-32"
                value="ONE_TIME"
                placeholder="Installment No."
                disabled
              />

              <Input
                type="text"
                className="w-48"
                value={newCourse.totalAmount}
                placeholder="Amount"
                readOnly
              />
            </div>
          </div>
        )}

        {installment === true && (
          <div className="mt-4">
            <Label>Installments Payments</Label>

            {installments.map((item, index) => (
              <div key={index} className="mb-3 flex items-center gap-3">
                <Input
                  type="text"
                  className="w-32"
                  value={item.installment}
                  placeholder="Installment No."
                  disabled
                />

                <Input
                  type="text"
                  className="w-48"
                  value={item.addAmount}
                  placeholder="Amount"
                  onChange={(e) =>
                    updateInstallment(index, "addAmount", e.target.value)
                  }
                />

                {index !== 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeInstallment(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}

            <Button size="sm" variant="outline" onClick={addInstallment}>
              + Add Installment
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            tabIndex={7}
            onClick={onCloseModal}
          >
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
