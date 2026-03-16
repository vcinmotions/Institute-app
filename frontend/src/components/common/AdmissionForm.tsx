"use client";
import React, { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Student } from "../../types/student";
import ModalCard from "./ModalCard";
import Alert from "../ui/alert/Alert";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { downloadAdmissionForm } from "@/app/utils/AdmissionFormDownload";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PrintConfigModal from "./PrintConfigModal";

interface Props {
  student: Student;
  companyDetails: any;
  onCloseModal: () => void;
}

const AdmissionForm: React.FC<Props> = ({
  student,
  onCloseModal,
  companyDetails,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const [printConfig, setPrintConfig] = useState({
    showLogo: true,
    showStudentPhoto: true,
    showStamp: true,
    showDeclaration: true,
    studentSign: true,
    letterHead: false,
  });

  console.log("GET PRINT CONFIGURE DATA:", printConfig);

  const [showConfigModal, setShowConfigModal] = useState(false);

  console.log("get Student in Student Admission Download Form:", student);
  console.log(
    "get companyDetails in Student Admission Download Form:",
    companyDetails,
  );

  useEffect(() => {
    if (student?.id) {
      console.log("Student ID available:", student.id);
    } else {
      console.warn("Student ID is undefined when query ran");
    }
  }, [student]);

  const apiClient = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // New: Download as PDF

  // function convertNumberToWords(num: number): string {
  //   // Use any number-to-words npm library or a basic formatter
  //   // Example: use `number-to-words` package
  //   return require('number-to-words').toWords(num);
  // }

  // Download PDF function using html2canvas + jsPDF
  const handleDownloadPDF = async () => {
    if (!formRef.current) return;

    try {
      setPdfLoading(true);

      // Capture form div as canvas
      const canvas = await html2canvas(formRef.current, {
        scale: 2, // Increase quality
        useCORS: true, // To load cross-origin images if any (like your logo)
      });

      const imgData = canvas.toDataURL("images/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`AdmissionForm_${student.fullName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: formRef,
    documentTitle: `${student.fullName}-admission-form`,
  });

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const studentId = student?.id;

  const {
    data: courseDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-courses", studentId],
    queryFn: async () => {
      if (!studentId || !token) throw new Error("Missing student ID or token");
      console.log("Get through here!!!!!s");
      const response = await apiClient.get(`/students/${studentId}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("get Response in react query for student course:", response);
      return response.data;
    },
    enabled: !!studentId && !!token, // only run when both exist
  });

  console.log("Get Student Course Details bt Student id:", courseDetails);
  console.log("🎯 studentId:", studentId);
  console.log("🔑 token loaded?", !!token);

  return (
    <ModalCard title="Admission Form" oncloseModal={onCloseModal}>
      <div className="p-4">
        <div className="flex justify-end gap-1.5 print:hidden">
          <button
            onClick={handlePrint}
            disabled={!formRef.current}
            className="mb-4 rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
          >
            🖨️ Print Form
          </button>

          <button
            className="mb-4 rounded bg-yellow-600 px-4 py-2 text-white transition hover:bg-yellow-700"
            onClick={() => setShowConfigModal(true)}
          >
            ⚙️ Configure Form
          </button>
          {/* <button
            onClick={() => downloadAdmissionForm(student, courseDetails)}
            disabled={pdfLoading || !formRef.current}
            className={`mb-4 rounded bg-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition ${pdfLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {pdfLoading ? 'Generating PDF...' : '⬇️ Download PDF'}
          </button> */}
        </div>

        {/* <div
          ref={formRef}
          className="print-a4 rounded border border-gray-500 bg-white p-8 font-serif text-sm leading-6 text-black"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >

          <div className="mb-6 border-b pb-4 text-center">
            <div className="flex items-center justify-between">
              {printConfig.showLogo && (
                <img
                  width={80}
                  height={80}
                  src={
                    user.logo
                      ? `${(
                        process.env.NEXT_PUBLIC_API_BASE_URL ??
                        "http://localhost:5001/api"
                      ).replace("/api", "")}/${user.logo.replace(/\\/g, "/")}`
                      : "/images/logo/institute-logo.png"
                  }
                  alt="user"
                />
              )}
              {printConfig.letterHead === true ? (
                <div className="h-32 flex-1 text-center"></div>
              ) : (
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-bold tracking-wide uppercase">
                    {user.clientAdmin ? user.clientAdmin?.name : user.name}
                  </h1>
                  <p className="mt-1 text-sm wrap-break-word whitespace-normal">
                    {user.clientAdmin ? user.clientAdmin?.fullAddress : user.fullAddress}
                  </p>
                  <p className="text-sm">
                    Phone: +91 {user.clientAdmin ? user.clientAdmin?.contact : user.contact} | Email: {user.clientAdmin ? user.clientAdmin?.email : user.email}
                  </p>
                </div>
              )}
              {printConfig.showStudentPhoto && (
                <div>
                  {student && (
                    <img
                      src={
                        student.photoUrl
                          ? `${(
                            process.env.NEXT_PUBLIC_API_BASE_URL ??
                            "http://localhost:5001/api"
                          ).replace("/api", "")}${student.photoUrl}`
                          : "/images/user/user-02.png"
                      }
                      alt={student.fullName || "Student"}
                      className="h-24 w-24 border border-gray-500 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
            <h2 className="mt-6 text-lg font-semibold underline">
              Admission Form
            </h2>
          </div>

          <h3 className="mb-2 text-base font-semibold underline">
            Student Information
          </h3>
          <table className="mb-6 w-full table-fixed border-collapse border border-gray-400">
            <tbody>
              <tr className="border">
                <td className="w-1/2 border p-2">
                  <strong>Reg. Number:</strong> {student.serialNumber}
                </td>
                <td className="border p-2">
                  <strong>Student ID:</strong> {student.studentCode}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Full Name:</strong>{" "}
                  {student.fullName?.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Father's Name:</strong>{" "}
                  {student.fatherName?.toLocaleUpperCase()}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Mother's Name:</strong>{" "}
                  {student.motherName?.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Gender:</strong> {student.gender?.toLocaleUpperCase()}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Date of Birth:</strong> {" "}
                  {new Date(student.dob).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
                </td>
                <td className="border p-2">
                  <strong>Religion:</strong>{" "}
                  {student.religion?.toLocaleUpperCase()}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Contact:</strong> {student.contact}
                </td>
                <td className="border p-2">
                  <strong>Parent Contact:</strong> {student.parentsContact}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Email:</strong> {student.email}
                </td>
                <td className="border p-2">
                  <strong>ID Proof:</strong> <br />
                  {student.idProofType?.toLocaleUpperCase()} -{" "}
                  {student.idProofNumber}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Residential Address:</strong>{" "}
                  {student.residentialAddress?.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Permanent Address:</strong>{" "}
                  {student.permenantAddress?.toLocaleUpperCase()}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="mb-2 text-base font-semibold underline">
            Course Information
          </h3>
          {courseDetails?.detailedCourses?.map((item: any, index: number) => {
            const course = item.studentCourse?.course;
            const fee = item.feeStructure;

            return (
              <table
                className="mb-3 w-full table-fixed border-collapse border border-gray-400"
                key={index}
              >
                <tbody>
                  <tr className="border">
                    <td className="w-1/2 border p-2">
                      <strong>Course Name:</strong>{" "}
                      {course?.name?.toLocaleUpperCase()}
                    </td>
                    <td className="border p-2">
                      <strong>Duration:</strong> {course?.durationWeeks ?? "--"}{" "}
                      Weeks
                    </td>
                  </tr>
                  <tr className="border">
                    <td className="border p-2">
                      <strong>Course Amount:</strong> ₹
                      {fee?.totalAmount ?? "N/A"}
                    </td>
                    <td className="border p-2">
                      <strong>Payment Type:</strong> {fee?.paymentType ?? "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            );
          })}


          {printConfig.showDeclaration && (
            <div className="mt-6">
              <h3 className="mb-2 text-base font-semibold underline">
                Declaration
              </h3>
              <p className="italic">
                I hereby declare that all the information provided above is true
                to the best of my knowledge. I agree to abide by the rules and
                regulations of the institute.
              </p>
            </div>
          )}


          <div className="mt-4 grid grid-cols-3 items-end gap-4">
            <div>
              <p className="text-sm">
                <strong>Admission Date:</strong>
                <br />
                {new Date(student.admissionDate).toLocaleDateString()}
              </p>
            </div>

            {printConfig.showStamp && (
              <div className="flex flex-col items-center justify-center text-center">
                <img
                  width={80}
                  height={80}
                  src={
                    user.stamp
                      ? `${(
                        process.env.NEXT_PUBLIC_API_BASE_URL ??
                        "http://localhost:5001/api"
                      ).replace(
                        "/api",
                        "",
                      )}/${user.stamp.replace(/\\/g, "/")}`
                      : "/images/logo/institute-stamp.png"
                  }
                  alt="user"
                />
                <p className="mt-1 text-xs">Institute Stamp</p>
              </div>
            )}
            {printConfig.studentSign && (
              <div className="text-right text-sm">
                <p className="mx-auto mt-8 w-40 border-t border-black"></p>
                <p className="px-8">Student Signature</p>
              </div>
            )}
          </div>
        </div> */}

        <div
          ref={formRef}
          className="print-a4 bg-white p-6 text-[13px] text-black border border-gray-500"
          style={{ fontFamily: "Times New Roman" }}
        >

          {/* HEADER */}
          <div className="flex justify-between items-start border-b pb-2">

            <div>
              <h1 className="text-2xl font-bold text-red-700">
                {companyDetails?.name}
              </h1>
              <p className="text-sm">Technical Institute</p>
            </div>

            <div className="text-sm space-y-1">
              <p><b>Reg. Form No :</b> {student.admissionNumber}</p>
              <p><b>Admission Date :</b> {new Date(student.admissionDate).toLocaleDateString()}</p>
              <p><b>Reg. Branch :</b> {companyDetails.city}</p>
            </div>

            <img
              src={
                student.photoUrl
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}${student.photoUrl}`
                  : "/images/user/user-02.png"
              }
              className="h-24 w-24 border"
            />

          </div>


          {/* STUDENT PERSONAL DETAILS */}

          <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm">
            STUDENT'S PERSONAL DETAILS
          </h2>

          <div className="border border-gray-400 p-2 space-y-1">

            <div className="flex gap-10">
              <p>
                <b>Student's Name :</b> {student.fullName}
              </p>
              <p>
                <b>Father's Name :</b> {student.fatherName}
              </p>

            </div>

            <div className="flex gap-10">

              <p>
                <b>Date Of Birth :</b> {new Date(student.dob).toLocaleDateString()}
              </p>

              <p>
                <b>Qualification :</b> -
              </p>

            </div>

            <p>
              <b>Residential Address :</b> {student.residentialAddress}
            </p>

            <p>
              <b>Permanent Address :</b> {student.permenantAddress}
            </p>

          </div>


          {/* CONTACT DETAILS */}

          <h2 className="mt-3 bg-red-700 text-white px-2 py-1 text-sm">
            CONTACT DETAILS
          </h2>

          <div className="border border-gray-400 p-2 space-y-1">

            <p>
              <b>Student Mobile Number :</b> {student.contact}
            </p>

            <p>
              <b>Email ID :</b> {student.email}
            </p>

            <p>
              <b>Alternate Contact :</b> {student.parentsContact}
            </p>

            <p>
              <b>Reference Details :</b> -
            </p>

          </div>


          {/* DOCUMENTS */}

          <h2 className="mt-3 bg-red-700 text-white px-2 py-1 text-sm">
            SUBMITTED DOCUMENTS
          </h2>

          <div className="border border-gray-400 p-2 flex gap-6">

            <label>
              <input type="checkbox" /> Aadhaar Card
            </label>

            <label>
              <input type="checkbox" /> Driving License
            </label>

            <label>
              <input type="checkbox" /> PAN Card
            </label>

            <label>
              <input type="checkbox" /> Others
            </label>

          </div>


          {/* COURSE TABLE */}

          <h2 className="mt-3 bg-red-700 text-white px-2 py-1 text-sm">
            COURSE DETAILS
          </h2>

          <table className="w-full border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">

                <th className="border p-1">Sr</th>
                <th className="border p-1">Course Name</th>
                <th className="border p-1">Date</th>
                <th className="border p-1">Course Fees</th>
                <th className="border p-1">Discount</th>
                <th className="border p-1">Advance</th>
                <th className="border p-1">Rec No</th>
                <th className="border p-1">Installment</th>
                <th className="border p-1">Receipt No</th>

              </tr>
            </thead>

            <tbody>

              {courseDetails?.detailedCourses?.map((item: any, index: number) => {

                const course = item.studentCourse?.course
                const fee = item.feeStructure

                return (

                  <tr key={index}>

                    <td className="border p-1">{index + 1}</td>
                    <td className="border p-1">{course?.name}</td>
                    <td className="border p-1">
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </td>
                    <td className="border p-1">{fee?.totalAmount}</td>
                    <td className="border p-1">{fee?.discount ?? "-"}</td>
                    <td className="border p-1">{fee?.advance ?? "-"}</td>
                    <td className="border p-1">-</td>
                    <td className="border p-1">{fee?.installment ?? "-"}</td>
                    <td className="border p-1">-</td>

                  </tr>

                )

              })}

            </tbody>
          </table>


          {/* BATCH INSTRUCTIONS */}

          <h2 className="mt-3 bg-red-700 text-white px-2 py-1 text-sm">
            BATCH INSTRUCTIONS
          </h2>

          <div className="flex gap-4 border border-gray-400 p-2">
            {courseDetails?.detailedCourses?.map((sc: any, index: number) => {
              const course = sc.studentCourse?.course;

              return (
                <div key={index} className="mb-2">
                  <p>
                    ({index + 1}) Course : {course?.name}
                  </p>

                  <p>
                    Time : ________
                  </p>

                  <p>
                    Duration : ________
                  </p>
                </div>
              );
            })}
          </div>


          {/* REMARKS */}

          <h2 className="mt-3 bg-red-700 text-white px-2 py-1 text-sm">
            REMARKS
          </h2>

          <div className="border border-gray-400 h-16"></div>


          {/* DECLARATION */}

          <div className="mt-4 text-xs">

            <p>
              I accept that I am liable to pay the fees before I will complete my course.
              Otherwise ABI Institute can take strict action for recovery of fees.
              Fees once paid will not be refundable under any circumstances.
            </p>

          </div>


          {/* FOOTER */}

          <div className="flex justify-between mt-6">

            <div>

              <p>Student Signature</p>

            </div>

            <div>

              <p>Staff Sign</p>

            </div>

          </div>


          {/* TRACKING */}

          <div className="mt-4 grid grid-cols-3 border border-gray-400 text-xs">

            <div className="border p-2">
              <b>I-Card Tracking</b>

              <div className="flex gap-2 mt-1">
                <label><input type="checkbox" /> Yes</label>
                <label><input type="checkbox" /> No</label>
                <label><input type="checkbox" /> NA</label>
              </div>
            </div>

            <div className="border p-2">
              <b>Exam Tracking</b>
            </div>

            <div className="flex gap-5 border p-2">
              <div>
                <b>Bag Required</b>

                <div className="flex gap-2 mt-1">
                  <label><input type="checkbox" /> Yes</label>
                  <label><input type="checkbox" /> No</label>
                  <label><input type="checkbox" /> NA</label>
                </div>
              </div>
              <div>
                <b>Student sign</b>
              </div>

            </div>

          </div>

        </div>

        {showConfigModal && (
          <PrintConfigModal
            initialConfig={printConfig}
            onClose={() => setShowConfigModal(false)}
            onSave={(config) => {
              setPrintConfig(config);
              setShowConfigModal(false);
            }}
          />
        )}
      </div>
    </ModalCard>
  );
};

export default AdmissionForm;
