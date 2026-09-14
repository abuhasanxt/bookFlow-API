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

const getAmenity = async () => {
  const result = await prisma.amenity.findMany();
  return result;
};

const updateAmenity = async (id: string, data: { name: string }) => {
  const existsAmenity = await prisma.amenity.findUnique({
    where: {
      id,
    },
  });
  if (!existsAmenity) {
    throw new AppError(status.NOT_FOUND, "Amenity not found");
  }

  if (existsAmenity.name === data.name) {
    throw new AppError(status.BAD_REQUEST, "Amenity already updated");
  }

  const duplicateAmenity = await prisma.amenity.findFirst({
    where: {
      name: data.name,
      NOT: {
        id,
      },
    },
  });

  if (duplicateAmenity) {
    throw new AppError(status.CONFLICT, "Amenity name already exists");
  }

  const result = await prisma.amenity.update({
    where: {
      id,
    },
    data: {
      name: data.name,
    },
  });

  return result;
};

const deleteAmenity = async (id: string) => {
  const existsAmenity = await prisma.amenity.findUnique({
    where: {
      id,
    },
  });
  if (!existsAmenity) {
    throw new AppError(status.NOT_FOUND, "Amenity not found");
  }
  await prisma.amenity.delete({
    where: {
      id,
    },
  });
  return {message:"Amenity Delete Successfully"};
};

export const amenityService = {
  createAmenity,
  getAmenity,
  updateAmenity,
  deleteAmenity
};
