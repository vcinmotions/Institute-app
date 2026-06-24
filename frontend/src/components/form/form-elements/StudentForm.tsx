"use client";

import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Components
import PrintConfigModal from "@/components/common/PrintConfigModal";
import Button from "@/components/ui/button/Button";

interface Props {
    studentData: any;
    companyDetails: any;
}

const StudentForm: React.FC<Props> = ({
    studentData,
    companyDetails,
}) => {
    const formRef = useRef<HTMLDivElement>(null);

    // States
    const [pdfLoading, setPdfLoading] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [printConfig, setPrintConfig] = useState({
        showLogo: true,
        showStudentPhoto: true,
        showStamp: true,
        showDeclaration: true,
        studentSign: true,
        letterHead: false,
    });

    // Extracting internal sub-objects safely from unified studentData container object
    const student = studentData?.student || {};
    const detailedCourses = studentData?.detailedCourses || [];

    console.log("GET STUDENT DATA IN ADMISSION FORM:", student);

    // Print Handler
    const handlePrint = useReactToPrint({
        contentRef: formRef,
        documentTitle: `${student?.fullName || "Student"}-Admission-Form`,
    });

    // PDF Download Handler (Multi-page Adaptive Layout Processing)
    const handleDownloadPDF = async () => {
        if (!formRef.current) return;

        try {
            setPdfLoading(true);

            const element = formRef.current;
            const originalBorder = element.style.border;
            const originalShadow = element.style.boxShadow;
            element.style.border = "none";
            element.style.boxShadow = "none";

            window.scrollTo(0, 0);

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                onclone: (doc) => {
                    const all = doc.querySelectorAll("*");
                    all.forEach((el: any) => {
                        const style = window.getComputedStyle(el);
                        if (style.color.includes("oklch")) {
                            el.style.color = "#000000";
                        }
                        if (style.backgroundColor.includes("oklch")) {
                            el.style.backgroundColor = "#ffffff";
                        }
                        if (style.borderColor.includes("oklch")) {
                            el.style.borderColor = "#000000";
                        }
                    });
                },
            });

            element.style.border = originalBorder;
            element.style.boxShadow = originalShadow;

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`AdmissionForm_${(student?.fullName || "Student").replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF file structural output. Please try again.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-6">

                {/* Header Information */}
                <div className="border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">
                        Document Preview
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review the admission form before printing or downloading. You can adjust visibility settings using the configuration button.
                    </p>
                </div>

                {/* A4 Page Preview Container */}
                <div className="Admission-form">

                    {/* THE PRINTABLE AREA */}
                    <div
                        ref={formRef}
                        className={`mx-auto bg-white p-8 text-[13px] text-black shadow-lg border border-gray-300 max-w-[210mm] min-h-[297mm] print:m-0 print:border-none print:shadow-none print:w-full print:h-auto ${printConfig.letterHead ? "pt-[120px]" : ""
                            }`}
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-3">
                            <div>
                                {printConfig.showLogo && (
                                    <h1 className="text-2xl font-bold text-red-700 uppercase tracking-wide"
                                        style={{ color: "#b91c1c" }}
                                    >
                                        {companyDetails?.name || "Institute Name"}
                                    </h1>
                                )}
                                <p className="text-sm font-semibold text-gray-700">
                                    {companyDetails?.instituteName || "Technical Institute"}
                                </p>
                            </div>

                            <div className="text-sm space-y-1 text-right">
                                <p><b>Reg. Form No :</b> {student?.admissionNumber || "-"}</p>
                                <p><b>Admission Date :</b> {student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-GB") : "-"}</p>
                                <p><b>Reg. Branch :</b> {companyDetails?.city || "Head Office"}</p>
                            </div>

                            {printConfig.showStudentPhoto && (
                                <div className="h-28 w-24 border-2 border-gray-400 flex items-center justify-center overflow-hidden bg-gray-50">
                                    <img
                                        src={
                                            student?.photoUrl
                                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}${student.photoUrl}`
                                                : "/images/user/user-02.png"
                                        }
                                        alt="Student Photo"
                                        className="h-full w-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            )}
                        </div>

                        {/* PERSONAL DETAILS */}
                        <h2 className="mt-5 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Student's Personal Details
                        </h2>
                        <div className="border border-black p-3 space-y-2 mt-1">
                            <div className="grid grid-cols-2 gap-4">
                                <p><b>Student's Name :</b> {student?.fullName || "-"}</p>
                                <p><b>Father's Name :</b> {student?.fatherName || "-"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <p><b>Date Of Birth :</b> {student?.dob ? new Date(student.dob).toLocaleDateString("en-GB") : "-"}</p>
                                <p><b>Qualification :</b> {student?.qualification || "-"}</p>
                            </div>
                            <p><b>Residential Address :</b> {student?.residentialAddress || "-"}</p>
                            <p><b>Permanent Address :</b> {student?.permenantAddress || "-"}</p>
                        </div>

                        {/* CONTACT DETAILS */}
                        <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Contact Details
                        </h2>
                        <div className="border border-black p-3 space-y-2 mt-1 grid grid-cols-2 gap-4">
                            <p><b>Mobile Number :</b> {student?.contact || "-"}</p>
                            <p><b>Email ID :</b> {student?.email || "-"}</p>
                            <p><b>Alternate Contact :</b> {student?.parentsContact || "-"}</p>
                            <p><b>Reference Details :</b> {student?.referedBy || "-"}</p>
                        </div>

                        {/* DOCUMENTS SECTION (Meticulously redacting Aadhaar number digits) */}
                        <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Submitted Documents
                        </h2>
                        <div className="border border-black p-3 mt-1 flex flex-wrap gap-8">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={student?.idProofType?.toLowerCase() === "aadhar card"} readOnly className="h-3 w-3 accent-black" />
                                Aadhaar Card {student?.idProofType?.toLowerCase() === "aadhar card" && <span className="text-[11px] text-gray-500 italic">([Aadhaar Redacted])</span>}
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={student?.idProofType?.toLowerCase() === "driving license"} readOnly className="h-3 w-3 accent-black" /> Driving License
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={student?.idProofType?.toLowerCase() === "pan card"} readOnly className="h-3 w-3 accent-black" /> PAN Card
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={!!student?.idProofType && !["aadhar card", "driving license", "pan card"].includes(student.idProofType.toLowerCase())}
                                    readOnly className="h-3 w-3 accent-black"
                                /> Others
                            </label>
                        </div>

                        {/* COURSE TABLE */}
                        <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Course Details
                        </h2>
                        <div className="mt-1">
                            <table className="w-full border-collapse border border-black text-xs text-center">
                                <thead>
                                    <tr className="bg-gray-200 print:bg-gray-200">
                                        <th className="border border-black p-1.5">Sr</th>
                                        <th className="border border-black p-1.5 text-left">Course Name</th>
                                        <th className="border border-black p-1.5">Start Date</th>
                                        <th className="border border-black p-1.5">End Date</th>
                                        <th className="border border-black p-1.5">Total Fees</th>
                                        <th className="border border-black p-1.5">Amount Paid</th>
                                        <th className="border border-black p-1.5">Amount Due</th>
                                        <th className="border border-black p-1.5">Rec No</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedCourses.length > 0 ? (
                                        detailedCourses.map((item: any, index: number) => {
                                            const courseName = item.studentCourse?.course?.name || "—";
                                            const fee = item.feeStructure || {};
                                            const primaryRecord = item.feeRecords?.[0] || {};

                                            return (
                                                <tr key={index}>
                                                    <td className="border border-black p-1.5">{index + 1}</td>
                                                    <td className="border border-black p-1.5 text-left font-medium">{courseName}</td>
                                                    <td className="border border-black p-1.5">
                                                        {item.studentCourse?.startDate
                                                            ? new Date(item.studentCourse.startDate).toLocaleDateString("en-GB")
                                                            : "—"}
                                                    </td>
                                                    <td className="border border-black p-1.5">
                                                        {item.studentCourse?.endDate
                                                            ? new Date(item.studentCourse.endDate).toLocaleDateString("en-GB")
                                                            : "—"}
                                                    </td>
                                                    <td className="border border-black p-1.5 font-semibold">INR {fee?.totalAmount ?? "0.00"}</td>
                                                    <td className="border border-black p-1.5 text-emerald-700 font-medium">INR {primaryRecord?.amountPaid ?? "0.00"}</td>
                                                    <td className="border border-black p-1.5 text-rose-600 font-medium">INR {primaryRecord?.amountDue ?? "0.00"}</td>
                                                    <td className="border border-black p-1.5 font-mono text-[11px]">{primaryRecord?.receiptNo || "—"}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="p-4 text-center">No structural courses assigned to this file.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* BATCH INSTRUCTIONS */}
                        <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Batch Instructions
                        </h2>
                        <div className="border border-black p-3 mt-1 grid grid-cols-2 gap-4">
                            {detailedCourses.length > 0 ? (
                                detailedCourses.map((item: any, index: number) => {
                                    const courseName = item.studentCourse?.course?.name || `Course #${item.studentCourse?.courseId || index + 1}`;
                                    return (
                                        <div key={index} className="space-y-1">
                                            <p className="font-semibold">({index + 1}) Course : {courseName}</p>
                                            <p>Batch ID Reference : Slot {item.studentCourse?.batchId || "—"}</p>
                                            <p>Status : <span className="text-emerald-700 font-medium">{item.studentCourse?.status || "—"}</span></p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 col-span-2 text-xs italic">No batch allocation maps found.</p>
                            )}
                        </div>

                        {/* REMARKS */}
                        <h2 className="mt-4 bg-red-700 text-white px-2 py-1 text-sm font-bold uppercase"
                            style={{ backgroundColor: "#b91c1c", color: "#ffffff" }}
                        >
                            Remarks / Inventory Tracking
                        </h2>
                        <div className="border border-black h-16 mt-1">
                            <div className="grid grid-cols-3 divide-x divide-black h-full">
                                <div className="p-2">
                                    <b className="block mb-1.5">I-Card Status</b>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-1"><input type="checkbox" checked={student?.idCard === true} readOnly className="accent-black" /> Issued</label>
                                        <label className="flex items-center gap-1"><input type="checkbox" checked={student?.idCard === false} readOnly className="accent-black" /> Pending</label>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <b className="block mb-1.5">Course Term</b>
                                    <span className="text-xs uppercase font-medium text-slate-700">{detailedCourses?.[0]?.feeStructure?.paymentType || "—"}</span>
                                </div>
                                <div className="p-2">
                                    <b className="block mb-1.5">Welcome Kit Bag</b>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-1"><input type="checkbox" checked={student?.bag === true} readOnly className="accent-black" /> Collected</label>
                                        <label className="flex items-center gap-1"><input type="checkbox" checked={student?.bag === false} readOnly className="accent-black" /> N/A</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DECLARATION */}
                        {printConfig.showDeclaration && (
                            <div className="mt-5 text-[11px] leading-relaxed text-justify">
                                <p>
                                    <b>Declaration:</b> I accept that I am liable to pay the fees before I will complete my course.
                                    Otherwise, the Institute can take strict action for the recovery of fees.
                                    Fees once paid will not be refundable under any circumstances. I have read and agree to all terms and conditions.
                                </p>
                            </div>
                        )}

                        {/* SIGNATURES */}
                        <div className="flex justify-between mt-12 px-8">
                            {printConfig.studentSign ? (
                                <div className="text-center">
                                    <div className="border-t border-black w-40 mb-1"></div>
                                    <p className="font-semibold">Student Signature</p>
                                </div>
                            ) : <div></div>}

                            <div className="text-center">
                                <div className="border-t border-black w-40 mb-1"></div>
                                <p className="font-semibold">Authorized Signatory</p>
                                {printConfig.showStamp && <p className="text-[10px] text-gray-500">(Institute Stamp)</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowConfigModal(true)}
                        className="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        ⚙️ Print Setup
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            size="sm"
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading || !formRef.current}
                            className="rounded bg-blue-600 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {pdfLoading ? "Generating..." : "⬇️ Download PDF"}
                        </Button>

                        <Button
                            size="sm"
                            variant="primary"
                            onClick={handlePrint}
                            disabled={!formRef.current}
                            className="rounded bg-brand-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 flex items-center gap-2"
                        >
                            🖨️ Print
                        </Button>
                    </div>
                </div>

                {/* Configuration Modal */}
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
        </div>
    );
};

export default StudentForm;