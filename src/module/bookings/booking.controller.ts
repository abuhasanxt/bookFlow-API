import { Request, Response } from "express";
import status from "http-status";

import { bookingService } from "./booking.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await bookingService.createBooking(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getBookings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const role = req.user.role;

    const all = req.query.all === "true";

    const result = await bookingService.getBookings(
      userId,
      role,
      all
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  }
);

const getBookingById = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const role = req.user.role;

    const { bookingId } = req.params;

    const result = await bookingService.getBookingById(
      userId,
      role,
      bookingId as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Booking retrieved successfully",
      data: result,
    });
  }
);
const cancelBooking = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const role = req.user.role;

    const { bookingId } = req.params;

    const result = await bookingService.cancelBooking(
      userId,
      role,
      bookingId as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  }
);
export const bookingController = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
