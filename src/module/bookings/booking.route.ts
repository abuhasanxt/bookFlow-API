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
);router.post(
  "/:bookingId/cancel",
  checkAuth(Role.ADMIN,Role.USER),
  bookingController.cancelBooking
);
router.get(
  "/",
  checkAuth(Role.ADMIN,Role.USER),
  bookingController.getBookings
);
router.get(
  "/:bookingId",
  checkAuth(Role.ADMIN,Role.USER),
  bookingController.getBookingById
);

export const bookingRoutes = router;
