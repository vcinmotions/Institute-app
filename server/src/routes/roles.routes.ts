import express from "express";
import {
  createRoleUserController,
  getRoleUsersController,
  updateRoleUserController,
} from "../controllers/roles.controller";

const router = express.Router();

router.post("/role-user", createRoleUserController);
router.put("/edit-role-user/:id", updateRoleUserController);
router.get("/role-user", getRoleUsersController);

export default router;
