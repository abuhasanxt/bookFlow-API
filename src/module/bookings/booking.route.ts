import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { createBookingZodSchema } from "./booking.validation";
import { bookingController } from "./booking.controller";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(createBookingZodSchema),
  bookingController.createBooking,
);
router.get(
  "/",
  checkAuth(Role.ADMIN,Role.USER),
  bookingController.getBookings
);

export const bookingRoutes = router;
