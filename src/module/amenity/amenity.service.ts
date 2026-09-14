import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const createAmenity = async (data: { name: string }) => {
  const existsName = await prisma.amenity.findUnique({
    where: {
      name: data.name,
    },
  });
  if (existsName) {
    throw new AppError(status.CONFLICT, "Amenity already exists");
  }

  const result = await prisma.amenity.create({
    data: {
      name: data.name,
    },
  });
  return result;
};

export const amenityService = {
  createAmenity,
};
