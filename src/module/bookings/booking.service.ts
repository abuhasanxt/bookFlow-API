/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateBooking, UpdateBooking } from "./booking.interface";
import { BookingStatus, Role } from "../../../generated/prisma/enums";

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
        status: BookingStatus.CONFIRMED,
        totalCents,
      },
    });

    return newBooking;
  });
  // Return Booking
  return booking;
};

const getBookings = async (userId: string, role: string, all?: boolean) => {
  const where: any = {};

  //get all booking admin
  if (!(role === Role.ADMIN && all === true)) {
    //user own booking
    where.userId = userId;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};
const getBookingById = async (
  userId: string,
  role: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },

    include: {
      resource: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          capacity: true,
          priceCentsPerHour: true,
          isActive: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Booking not found
  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  // USER  ownership check
  if (role !== Role.ADMIN && booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to view this booking",
    );
  }

  return booking;
};

const cancelBooking = async (
  userId: string,
  role: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  // Booking not found
  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  // Ownership check
  if (role !== Role.ADMIN && booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to cancel this booking",
    );
  }

  // Already cancelled
  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Booking is already cancelled");
  }

  // Cancel booking
  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },

    data: {
      status: BookingStatus.CANCELLED,
    },
  });

  return result;
};
const updateBooking = async (
  userId: string,
  role: string,
  bookingId: string,
  data: UpdateBooking,
) => {
  const { startTime, endTime } = data;

  //  Find existing booking
  const existingBooking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      resource: true,
    },
  });

  if (!existingBooking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  //  Ownership check
  if (role !== Role.ADMIN && existingBooking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this booking",
    );
  }

  //  Cannot update cancelled booking
  if (existingBooking.status === BookingStatus.CANCELLED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cancelled booking cannot be rescheduled",
    );
  }

  //  Convert time
  const bookingStart = new Date(startTime);
  const bookingEnd = new Date(endTime);

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
// Same time check
if (
  existingBooking.startTime.getTime() === bookingStart.getTime() &&
  existingBooking.endTime.getTime() === bookingEnd.getTime()
) {
  throw new AppError(
    status.BAD_REQUEST,
    "Booking already has these times"
  );
}
  //  Get day of booking
  const startOfDay = new Date(bookingStart);
  startOfDay.setHours(0, 0, 0, 0);
  const dayOfWeek = bookingStart.getDay();

  //  Resource opening hours
  const resourceHour = await prisma.resourceHours.findFirst({
    where: {
      resourceId: existingBooking.resourceId,
      dayOfWeek,
    },
  });

  if (!resourceHour) {
    throw new AppError(status.BAD_REQUEST, "Resource is closed on this day");
  }
  //  Create opening and closing Datetime
  const date = `${bookingStart.getFullYear()}-${String(
    bookingStart.getMonth() + 1,
  ).padStart(2, "0")}-${String(bookingStart.getDate()).padStart(2, "0")}`;
  const openTime = new Date(`${date}T${resourceHour.openTime}:00`);

  const closeTime = new Date(`${date}T${resourceHour.closeTime}:00`);

  //  Check opening hours
  if (bookingStart < openTime || bookingEnd > closeTime) {
    throw new AppError(
      status.BAD_REQUEST,
      `Booking time must be between ${resourceHour.openTime} and ${resourceHour.closeTime}`,
    );
  }

  //  Calculate Duration
  const durationMs = bookingEnd.getTime() - bookingStart.getTime();

  const durationHours = durationMs / (1000 * 60 * 60);

  const totalCents = Math.round(
    durationHours * existingBooking.resource.priceCentsPerHour,
  );

  //  Transaction
  const updatedBooking = await prisma.$transaction(async (tx) => {
    // Check overlapping booking
    const overlappingBooking = await tx.booking.findFirst({
      where: {
        resourceId: existingBooking.resourceId,

        status: BookingStatus.CONFIRMED,

        startTime: {
          lt: bookingEnd,
        },

        endTime: {
          gt: bookingStart,
        },

        // Don't compare with itself
        id: {
          not: bookingId,
        },
      },
    });
    // If Slot Already Booked
    if (overlappingBooking) {
      throw new AppError(status.CONFLICT, "This time slot is already booked");
    }
    // Create Booking
    try {
      const result = await tx.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          startTime: bookingStart,
          endTime: bookingEnd,
          totalCents,
        },
      });

      return result;
    } catch (error: any) {
      // PostgreSQL exclusion constraint
      if (error?.code === "P2004") {
        throw new AppError(status.CONFLICT, "This time slot is already booked");
      }

      throw error;
    }
  });

  return updatedBooking;
};

const deleteBooking = async (
  userId: string,
  bookingId: string,
  role: Role
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  // Only cancelled booking can be deleted
  if (booking.status !== BookingStatus.CANCELLED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only cancelled bookings can be deleted"
    );
  }

  // Admin can delete any cancelled booking
  // User can delete only their own cancelled booking
  if (role !== Role.ADMIN && booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only delete your own booking"
    );
  }

  const result = await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });

  return result;
};
export const bookingService = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBooking,
  deleteBooking
};
