import express from "express";
import { amenityController } from "./amenity.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createAmenityZodSchema } from "./amenity.validation";

const router = express.Router();
router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createAmenityZodSchema),
  amenityController.createAmenity,
);
router.patch("/:id",amenityController.updateAmenity)
router.get("/",amenityController.getAmenity)
export const amenityRoutes = router;
