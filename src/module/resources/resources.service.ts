import { Prisma } from "../../../generated/prisma/client";
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

export const resourceService = {
  createResource,
  getResources,
};
