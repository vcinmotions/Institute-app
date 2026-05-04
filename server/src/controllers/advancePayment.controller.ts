import { Request, Response } from "express";
import { generatePaymentReceiptNumber } from "../utils/paymentReceiptConfig";
import { parseDate } from "../helpers/date";

export async function createAdvancePaymentController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { advancePayments } = req.body; // Array of advance payments

    if (!advancePayments || !Array.isArray(advancePayments)) {
      return res.status(400).json({ error: "Invalid advance payments data" });
    }

    const clientAdminId = user.clientAdminId;
    const results = [];

    for (const payment of advancePayments) {
      const { courseId, courseName, advanceAmount, paymentMode, paymentDate } = payment;

      if (!courseId || !advanceAmount || parseFloat(advanceAmount) <= 0) {
        continue; // Skip invalid payments
      }

      // Generate receipt number
      const receiptNo = await generatePaymentReceiptNumber(prisma, clientAdminId);

      // Use a temporary placeholder studentId (0) for advance payments
      // This will be updated to the actual studentId when the student is created
      const tempStudentId = 0;

      // Create student fee record for advance payment
      const studentFee = await prisma.studentFee.create({
        data: {
          studentId: tempStudentId, // Temporary placeholder, will be updated when student is created
          courseId: Number(courseId),
          dueDate: new Date(paymentDate || Date.now()),
          amountDue: parseFloat(advanceAmount),
          amountPaid: parseFloat(advanceAmount),
          paymentMode: paymentMode || "CASH",
          receiptNo,
          paymentStatus: "SUCCESS",
          clientAdminId,
          sourceType: "ADVANCE_PAYMENT",
        },
      });

      // Create financial record
      await prisma.financialRecord.create({
        data: {
          clientAdminId,
          recordType: "INCOME",
          amount: parseFloat(advanceAmount),
          paymentMode: paymentMode || "CASH",
          date: new Date(paymentDate || Date.now()),
          description: `Advance payment of ₹${advanceAmount} for ${courseName}`,
          studentId: tempStudentId, // Temporary placeholder, will be updated when student is created
          courseId: Number(courseId),
        },
      });

      results.push({
        courseId,
        courseName,
        advanceAmount,
        receiptNo,
        paymentStatus: "SUCCESS",
      });
    }

    return res.status(201).json({
      message: "Advance payments processed successfully",
      payments: results,
    });
  } catch (error) {
    console.error("Advance payment error:", error);
    return res.status(500).json({ error: "Failed to process advance payments" });
  }
}

export async function updateAdvancePaymentController(
  req: any,
  res: any
) {
  const { id } = req.params;
  const { amountPaid, paymentDate, paymentMode } = req.body;

  console.log("UPDATE ADVANCE PAYMENT REQ BODY:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;
    const paidAmount = parseFloat(amountPaid);

    if (!paidAmount || paidAmount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    const parsedPaymentDate = parseDate(paymentDate);

    const result = await tenantPrisma.$transaction(async (tx: any) => {
      // Find the advance payment record
      const advancePayment = await tx.studentFee.findUnique({
        where: { id: parseInt(id) },
        include: {
          feeLogs: true,
          student: true,
          course: true,
        },
      });

      if (!advancePayment) {
        throw new Error("Advance payment not found");
      }

      // Verify this is an advance payment
      if (advancePayment.sourceType !== "ADVANCE_PAYMENT") {
        throw new Error("This is not an advance payment record");
      }

      const { studentId, courseId } = advancePayment;
      let courseName = "Unknown Course";

      if (advancePayment.course) {
        courseName = advancePayment.course.name;
      }

      // -----------------------------
      // Determine total advance amount allowed
      // -----------------------------
      const totalAdvanceAmount = advancePayment.amountDue;
      const currentTotalPaid = advancePayment.feeLogs.reduce(
        (sum: number, log: any) => sum + log.amountPaid,
        0
      ) + advancePayment.amountPaid; // Include initial advance payment

      // -----------------------------
      // Prevent overpayment
      // -----------------------------
      if (currentTotalPaid + paidAmount > totalAdvanceAmount) {
        throw new Error("Payment exceeds remaining advance amount");
      }

      // -----------------------------
      // Create payment log
      // -----------------------------
      const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);
      const log = await tx.studentFeeLog.create({
        data: {
          studentFee: {
            connect: { id: advancePayment.id },
          },
          amountPaid: paidAmount,
          paymentDate: parsedPaymentDate ? new Date(parsedPaymentDate) : null,
          paymentMode,
          receiptNo,
        },
      });

      const newTotalPaid = currentTotalPaid + paidAmount;
      const remainingDue = Math.max(totalAdvanceAmount - newTotalPaid, 0);
      const paymentStatus =
        remainingDue === 0 ? "SUCCESS" : "PENDING";

      // -----------------------------
      // Update StudentFee summary
      // -----------------------------
      const updatedFee = await tx.studentFee.update({
        where: { id: advancePayment.id },
        data: {
          amountPaid: newTotalPaid,
          amountDue: remainingDue,
          paymentStatus,
          paymentDate: parsedPaymentDate ? new Date(parsedPaymentDate) : new Date(),
        },
      });

      // -----------------------------
      // Create Financial Record
      // -----------------------------
      await tx.financialRecord.create({
        data: {
          clientAdminId,
          recordType: "INCOME",
          amount: paidAmount,
          paymentMode,
          date: parsedPaymentDate ? new Date(parsedPaymentDate) : new Date(),
          description: `Advance payment of ₹${paidAmount} from ${advancePayment.student.fullName} for ${courseName}`,
          studentId: advancePayment.student.id,
          courseId: courseId ?? undefined,
        },
      });

      return { log, updatedFee };
    });

    return res.status(200).json({
      message: "Advance payment updated successfully",
      paymentLog: result.log,
      payment: result.updatedFee,
    });
  } catch (error: any) {
    console.error("Advance payment update error:", error.message);

    return res.status(400).json({
      error: error.message || "Internal server error",
    });
  }
}
