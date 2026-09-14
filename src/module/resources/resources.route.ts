import express from "express"
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createResourceValidationSchema } from "./resources.validation";
import { resourceController } from "./resources.controller";
const router=express.Router()

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createResourceValidationSchema),
  resourceController.createResource
);

router.get("/",resourceController.getResources)
router.get(
  "/:id",
  resourceController.getResourceById
);

export const resourceRoutes=router