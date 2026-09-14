import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { GetResourcesQuery, ResourceData } from "./resources.interface";

const createResource = async (payload: ResourceData) => {
  const { amenityIds, ...resourceData } = payload;

  const result = await prisma.resource.create({
    data: {
      ...resourceData,

      ...(amenityIds?.length && {
        amenities: {
          connect: amenityIds.map((id) => ({
            id,
          })),
        },
      }),
    },

    include: {
      amenities: true,
    },
  });

  return result;
};

const getResources = async (query: GetResourcesQuery) => {
  const {
    type,
    minCapacity,
    amenity,
    availableFrom,
    availableTo,
    sortBy = "priceCentsPerHour",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.ResourceWhereInput = {
    isActive: true,

    ...(type && {
      type,
    }),

    ...(minCapacity !== undefined && {
      capacity: {
        gte: minCapacity,
      },
    }),

    ...(amenity && {
      amenities: {
        some: {
          id: amenity,
        },
      },
    }),

    ...(availableFrom &&
      availableTo && {
        bookings: {
          none: {
            startTime: {
              lt: new Date(availableTo),
            },
            endTime: {
              gt: new Date(availableFrom),
            },
          },
        },
      }),
  };

  const [resources, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,

      include: {
        amenities: true,
      },

      orderBy: {
        [sortBy]: sortOrder,
      },

      skip,
      take: limit,
    }),

    prisma.resource.count({
      where,
    }),
  ]);

  return {
    data: resources,

    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};
const getResourceById = async (resourceId: string) => {
  const result = await prisma.resource.findUnique({
    where: {
      id: resourceId,
      isActive: true,
    },
    include: {
      amenities: true,
      hours: true,
    },
  });

  if (!result) {
    throw new AppError(
      status.NOT_FOUND,
      "Resource not found"
    );
  }

  return result;
};
export const resourceService = {
  createResource,
  getResources,
  getResourceById
};
