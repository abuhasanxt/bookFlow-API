import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createResourceValidationSchema,
  updateResourceHoursSchema,
  updateResourceValidationSchema,
} from "./resources.validation";
import { resourceController } from "./resources.controller";
const router = express.Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createResourceValidationSchema),
  resourceController.createResource,
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateResourceValidationSchema),
  resourceController.updateResource,
);
router.put(
  "/:resourceId/hours",
  checkAuth(Role.ADMIN),
  validateRequest(updateResourceHoursSchema),
  resourceController.updateResourceHours,
);
router.get(
  "/:resourceId/availability",
  resourceController.getAvailability,
);
router.get("/", resourceController.getResources);
router.get("/:id", resourceController.getResourceById);
router.delete("/:id", checkAuth(Role.ADMIN), resourceController.deleteResource);

export const resourceRoutes = router;
