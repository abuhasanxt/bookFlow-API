import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateBooking } from "./booking.interface";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBooking = async (userId: string, data: CreateBooking) => {
  const { resourceId, startTime, endTime } = data;

  //  Resource check
  const resource = await prisma.resource.findUnique({
    where: {
      id: resourceId,
    },
  });

  if (!resource) {
    throw new AppError(status.NOT_FOUND, "Resource not found");
  }
  // Check Resource Active
  if (!resource.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      "This resource is currently inactive",
    );
  }
  //  Convert time
  const bookingStart = new Date(startTime);
  const bookingEnd = new Date(endTime);
  //  Validate Date
  if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
    throw new AppError(status.BAD_REQUEST, "Invalid startTime or endTime");
  }

  //  Start must be before end
  if (bookingStart >= bookingEnd) {
    throw new AppError(
      status.BAD_REQUEST,
      "End time must be greater than start time",
    );
  }

  //  Get day of booking
  const startOfDay = new Date(bookingStart);
  startOfDay.setHours(0, 0, 0, 0);

  const dayOfWeek = bookingStart.getDay();

  //  Get resource opening hours
  const resourceHour = await prisma.resourceHours.findFirst({
    where: {
      resourceId,
      dayOfWeek,
    },
  });

  //  Check Resource is Open
  if (!resourceHour) {
    throw new AppError(status.BAD_REQUEST, "Resource is closed on this day");
  }

  //  Create opening and closing Datetime
  const date = `${bookingStart.getFullYear()}-${String(
    bookingStart.getMonth() + 1,
  ).padStart(2, "0")}-${String(bookingStart.getDate()).padStart(2, "0")}`;

  const openTime = new Date(`${date}T${resourceHour.openTime}:00`);

  const closeTime = new Date(`${date}T${resourceHour.closeTime}:00`);

  //  Booking must be inside opening hours
  if (bookingStart < openTime || bookingEnd > closeTime) {
    throw new AppError(
      status.BAD_REQUEST,
      `Booking time must be between ${resourceHour.openTime} and ${resourceHour.closeTime}`,
    );
  }
  //  Calculate Duration
  const durationMs = bookingEnd.getTime() - bookingStart.getTime();

  const durationHours = durationMs / (1000 * 60 * 60);
  //  Calculate Total Price
  const totalCents = Math.round(durationHours * resource.priceCentsPerHour);
  // Create Booking inside Transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Check Existing Overlap
    const overlappingBooking = await tx.booking.findFirst({
      where: {
        resourceId,

        status: BookingStatus.CONFIRMED,

        startTime: {
          lt: bookingEnd,
        },

        endTime: {
          gt: bookingStart,
        },
      },
    });
    // If Slot Already Booked
    if (overlappingBooking) {
      throw new AppError(status.CONFLICT, "This time slot is already booked");
    }
    // Create Booking
    const newBooking = await tx.booking.create({
      data: {
        resourceId,
        userId,
        startTime: bookingStart,
        endTime: bookingEnd,
        status: "CONFIRMED",
        totalCents,
      },
    });

    return newBooking;
  });
  // Return Booking
  return booking;
};

export const bookingService = { createBooking };
