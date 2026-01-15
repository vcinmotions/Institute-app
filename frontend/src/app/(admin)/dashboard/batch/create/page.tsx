"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useCreateBatch } from "@/hooks/useCreateBatch";
import { useFetchFaculty } from "@/hooks/queries/useQueryFetchFaculty";
import { ChevronDownIcon, CloseLineIcon } from "@/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFaculties } from "@/store/slices/facultySlice";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getBatch, getLab } from "@/lib/api";
import { setLab } from "@/store/slices/labSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { redirect } from "next/navigation";
import { useBatchStore } from "@/store/batchStore";
import { useRouter } from "next/navigation";

export default function BatchForm() {
  const [name, setName] = useState("");
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const labs = useSelector((state: RootState) => state.lab.labs);
  const batches = useSelector((state: RootState) => state.batch.batches);
  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });
  const { form, reset, setField } = useBatchStore();
  const token = useSelector((state: RootState) => state.auth.token);
  const { mutate: createBatch } = useCreateBatch();
  const dispatch = useDispatch();

  const { data: facultyData } = useFetchFaculty();
  const facultyList = useSelector(
    (state: RootState) => state.faculty.faculties,
  );
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);

  console.log("GET LAB DATA in BATCH CRETAE ROUTE:", labs);
  console.log("GET TIMESLOT DATA in BATCH CRETAE ROUTE:", timeSlots);

  console.log("GET BATCHES DATA in BATCH CRETAE ROUTE:", batches);
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Restore Zustand fields
  useEffect(() => {
    if (form.name) setName(form.name);
    if (form.selectedLab) setSelectedLab(form.selectedLab);
    if (form.selectedTimeSlot) setSelectedTimeSlot(form.selectedTimeSlot);
    if (form.selectedFaculty) setSelectedFaculty(form.selectedFaculty);
  }, []);

  // useEffect(() => {
  //             const handleKeyDown = (e: KeyboardEvent) => {
  //               if (e.key === "Escape") {
  //               e.preventDefault();
  //               redirect('/dashboard/batch');
  //             }
  //             };

  //             window.addEventListener("keydown", handleKeyDown);
  //             return () => window.removeEventListener("keydown", handleKeyDown);
  //           }, []);

  useEffect(() => {
    const fetchLab = async () => {
      if (!token) {
        throw new Error("token Not Found");
      }
      try {
        const responseLab = await getLab({ token });
        const responseBatch = await getBatch({ token });

        dispatch(setLab(responseLab.labs));
        dispatch(setBatches(responseBatch.batch));
      } catch (error) {
        console.error("Error in Fetch Lab:", error);
      }
    };

    fetchLab();
  }, [facultyData, dispatch]);

  useEffect(() => {
    if (facultyData?.faculty) {
      dispatch(setFaculties(facultyData.faculty));
    }
  }, [facultyData, dispatch]);

  // ✅ Validation
  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = "Batch name is required.";
    if (!selectedLab) newErrors.lab = "Please select a lab.";
    if (!selectedTimeSlot) newErrors.timeslot = "Please select a time slot.";

    setErrors(newErrors);

    setTimeout(() => setErrors({}), 3000);
    return Object.keys(newErrors).length === 0;
  };
  const hanldeDeselectLab = () => {
    setSelectedLab(null);
  };

  const hanldeDeselectLTimeslot = () => {
    setSelectedTimeSlot(null);
  };

  // Reset Form
  const handleResetForm = () => {
    reset();

    setName("");
    setSelectedLab(null);
    setSelectedTimeSlot(null);
    setSelectedFaculty(null);
    setTimeSlots([]);
  };

  // ✅ Submit Handler (Matches Backend)
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

    const payload = {
      name,
      labTimeSlotId: Number(selectedTimeSlot),
      facultyId: selectedFaculty ? Number(selectedFaculty) : undefined,
    };

    createBatch(payload, {
      onSuccess: () => {
        setAlert({
          show: true,
          title: "Batch Created",
          message: "Batch added successfully ✅",
          variant: "success",
        });

        reset();

        setTimeout(() => {
          //redirect("/dashboard/batch");
          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
      },
    });
  };

  console.log("GET SELECTED LABDATA :", selectedLab);
  console.log("GET SELECTED BTCH DATA IN STORE:", form);
  return (
    <div>
      <PageBreadcrumb pageTitle="Create Batch" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        <div className="space-y-8">
          <h2 className="border-b pb-6">Batch Infomation</h2>

          {alert.show && (
            <Alert
              variant={alert.variant as any}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          {/* ✅ Batch Name */}
          <div>
            <Label>Batch Name *</Label>
            <Input
              ref={firstInputRef}
              tabIndex={1}
              type="text"
              placeholder="LAB-01 Morning Batch"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setField("name", e.target.value); // ✅ Correct
              }}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* ✅ Select Lab */}
          <div>
            <Label>Select Lab *</Label>
            <div className="relative" data-master="lab">
              <Select
                options={labs.map((l) => ({ label: l.name, value: l.id }))}
                onChange={(val) => {
                  const labId = Number(val);
                  setSelectedLab(labId);
                  setField("selectedLab", labId); // ✅ save to Zustand

                  const lab = labs.find((l) => l.id === labId);

                  if (!lab) {
                    setTimeSlots([]);
                    return;
                  }

                  console.log("Selected Lab Id:", labId);

                  // 1️⃣ Get all used timeslots for THIS lab
                  const usedTimeSlotIds = batches
                    .filter((b) => b.labTimeSlotId === labId)
                    .map((b) => b.labTimeSlotId);

                  console.log("Used TimeSlot IDs:", usedTimeSlotIds);

                  // 2️⃣ Filter lab timeslots that are NOT used
                  const freeTimeSlots = lab.timeSlots.filter(
                    (ts: { id: number }) => !usedTimeSlotIds.includes(ts.id),
                  );

                  console.log("Available TimeSlots:", freeTimeSlots);

                  // 3️⃣ Update state
                  setTimeSlots(freeTimeSlots);
                  setSelectedTimeSlot(null);
                }}
                value={selectedLab ? selectedLab.toString() : ""} // ⭐ brings back placeholder
                placeholder={selectedLab === null ? "Choose Lab" : ""}
                className="dark:bg-dark-900"
                tabIndex={2}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {selectedLab !== null ? (
                  <CloseLineIcon
                    className="cursor-pointer"
                    onClick={hanldeDeselectLab}
                  />
                ) : (
                  <ChevronDownIcon />
                )}
              </span>
            </div>
            {errors.lab && <p className="text-sm text-red-500">{errors.lab}</p>}
          </div>

          {/* ✅ Lab Time Slot */}
          <div>
            <Label>Select Time Slot *</Label>
            <div className="relative" data-master="lab">
              <Select
                options={timeSlots.map((ts) => ({
                  label: `${ts.startTime} - ${ts.endTime} (Free PCs: ${ts.availablePCs})`,
                  value: ts.id,
                }))}
                //onChange={(val) => setSelectedTimeSlot(Number(val))}
                onChange={(val) => {
                  const ts = Number(val);
                  setSelectedTimeSlot(ts);
                  setField("selectedTimeSlot", ts);
                }}
                value={selectedTimeSlot ? selectedTimeSlot.toString() : ""} // ⭐ brings back placeholder
                placeholder={
                  selectedTimeSlot === null ? "Choose Time Slot" : ""
                }
                className="dark:bg-dark-900"
                tabIndex={3}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {selectedTimeSlot !== null ? (
                  <CloseLineIcon
                    className="cursor-pointer"
                    onClick={hanldeDeselectLTimeslot}
                  />
                ) : (
                  <ChevronDownIcon />
                )}
              </span>
            </div>
            {errors.timeslot && (
              <p className="text-sm text-red-500">{errors.timeslot}</p>
            )}
          </div>

          {/* ✅ Faculty Assign Optional */}
          <div>
            <Label>Assign Faculty (Optional)</Label>
            <div className="relative" data-master="faculty">
              <Select
                options={facultyList.map((f: any) => ({
                  label: f.name,
                  value: f.id,
                }))}
                //onChange={(val) => setSelectedFaculty(Number(val))}
                onChange={(val) => {
                  const fac = Number(val);
                  setSelectedFaculty(fac);
                  setField("selectedFaculty", fac);
                }}
                placeholder="Select Faculty"
                className="dark:bg-dark-900"
                tabIndex={4}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* ✅ Action Buttons */}
          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              tabIndex={5}
              onClick={handleResetForm}
            >
              Close
            </Button>
            <Button size="sm" tabIndex={6} onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
