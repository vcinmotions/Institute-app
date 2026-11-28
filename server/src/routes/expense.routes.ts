import express from "express";
import {
  createExpenseController,
  getExpensesController,
  updateExpenseController,
  deleteExpenseController,
} from "../controllers/expense.controller";

const router = express.Router();

router.post("/expense", createExpenseController);
router.get("/expense", getExpensesController);
router.put("/expense/:id", updateExpenseController);
router.delete("/expense/:id", deleteExpenseController);

export default router;
