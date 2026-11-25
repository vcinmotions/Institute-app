import express from "express";
import {
  createRoleUserController,
  getRoleUsersController,
  updateRoleUserController,
  getMyCompaniesController,
} from "../controllers/roles.controller";

import {
  listAccessRoles, createAccessRole, updateAccessRole, deleteAccessRole, setAccessRolePermissions, resetAccessRole, myPermissions,
} from "../controllers/accessRole.controller";

const router = express.Router();

// Role Management + Role Access (Super Admin only - see roleGuard) and the caller's own permissions.
router.get("/access-roles", listAccessRoles);
router.post("/access-roles", createAccessRole);
router.put("/access-roles/:id", updateAccessRole);
router.delete("/access-roles/:id", deleteAccessRole);
router.put("/access-roles/:id/permissions", setAccessRolePermissions);
router.post("/access-roles/:id/reset", resetAccessRole);
router.get("/my-permissions", myPermissions);

router.post("/role-user", createRoleUserController);
router.put("/edit-role-user/:id", updateRoleUserController);
router.get("/role-user", getRoleUsersController);
router.get("/my-companies", getMyCompaniesController);

export default router;
