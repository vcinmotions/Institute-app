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
  companyDetails: any[];
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
        <div
          ref={formRef}
          className="print-a4 rounded border border-gray-500 bg-white p-8 font-serif text-sm leading-6 text-black"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Header */}
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
                    {user.name}
                  </h1>
                  <p className="mt-1 text-sm wrap-break-word whitespace-normal">
                    {user.fullAddress}
                  </p>
                  <p className="text-sm">
                    Phone: +91 {user.contact} | Email: {user.email}
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

          {/* Student Information */}
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
                  {student.fullName.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Father's Name:</strong>{" "}
                  {student.fatherName.toLocaleUpperCase()}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Mother's Name:</strong>{" "}
                  {student.motherName.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Gender:</strong> {student.gender.toLocaleUpperCase()}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Date of Birth:</strong> {student.dob}
                </td>
                <td className="border p-2">
                  <strong>Religion:</strong>{" "}
                  {student.religion.toLocaleUpperCase()}
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
                  {student.idProofType.toLocaleUpperCase()} -{" "}
                  {student.idProofNumber}
                </td>
              </tr>
              <tr className="border">
                <td className="border p-2">
                  <strong>Residential Address:</strong>{" "}
                  {student.residentialAddress.toLocaleUpperCase()}
                </td>
                <td className="border p-2">
                  <strong>Permanent Address:</strong>{" "}
                  {student.permenantAddress.toLocaleUpperCase()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Course Details */}
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
                      {course?.name.toLocaleUpperCase()}
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

          {/* Declaration */}
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

          {/* Footer Section */}
          <div className="mt-4 grid grid-cols-3 items-end gap-4">
            <div>
              <p className="text-sm">
                <strong>Admission Date:</strong>
                <br />
                {new Date(student.admissionDate).toLocaleDateString()}
              </p>
            </div>
            {/* {printConfig.showLogo && (
              <div className="text-center">
                <img
                  src="/images/logo/institute-stamp.png"
                  alt="Institute Stamp"
                  className="mx-auto h-20 w-20"
                />
                <p className="mt-1 text-xs">Institute Stamp</p>
              </div>
            )} */}
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
