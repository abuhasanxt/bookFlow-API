import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { GetResourcesQuery, ResourceData, UpdateResourceData } from "./resources.interface";

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


const updateResource = async (
  resourceId: string,
  payload: UpdateResourceData
) => {
  const { amenityIds, ...resourceData } = payload;

  //  Check resource exists
  const existingResource = await prisma.resource.findUnique({
    where: {
      id: resourceId,
    },
    include: {
      amenities: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existingResource) {
    throw new AppError(
      status.NOT_FOUND,
      "Resource not found"
    );
  }

  //  Validate amenity IDs
  if (amenityIds !== undefined) {
    const uniqueAmenityIds = [...new Set(amenityIds)];

    const amenities = await prisma.amenity.findMany({
      where: {
        id: {
          in: uniqueAmenityIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundAmenityIds = new Set(
      amenities.map((amenity) => amenity.id)
    );

    const invalidAmenityIds = uniqueAmenityIds.filter(
      (id) => !foundAmenityIds.has(id)
    );

    if (invalidAmenityIds.length > 0) {
      throw new AppError(
        status.NOT_FOUND,
        `Invalid amenity ID: ${invalidAmenityIds.join(", ")}`
      );
    }
  }

  // Check resource field changed
  const resourceChanged = Object.entries(resourceData).some(
    ([key, value]) => {
      return (
        existingResource[
          key as keyof typeof existingResource
        ] !== value
      );
    }
  );

  // Check amenities changed
  let amenitiesChanged = false;

  if (amenityIds !== undefined) {
    const oldAmenityIds = existingResource.amenities
      .map((amenity) => amenity.id)
      .sort();

    const newAmenityIds = [...new Set(amenityIds)].sort();

    amenitiesChanged =
      JSON.stringify(oldAmenityIds) !==
      JSON.stringify(newAmenityIds);
  }

  //  Nothing changed
  if (!resourceChanged && !amenitiesChanged) {
    throw new AppError(
      status.BAD_REQUEST,
      "Resource is already updated"
    );
  }

  //  Update
  const result = await prisma.resource.update({
    where: {
      id: resourceId,
    },
    data: {
      ...resourceData,

      ...(amenityIds !== undefined && {
        amenities: {
          set: [...new Set(amenityIds)].map((id) => ({
            id,
          })),
        },
      }),
    },
    include: {
      amenities: true,
      hours: true,
    },
  });

  return result;
};
const updateResourceHours = async (
  resourceId: string,
  hours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }[],
) => {
  //  Check resource
  const resource = await prisma.resource.findUnique({
    where: {
      id: resourceId,
    },
  });

  if (!resource) {
    throw new AppError(status.NOT_FOUND, "Resource not found");
  }

  //  Validate time
  for (const hour of hours) {
    if (hour.openTime >= hour.closeTime) {
      throw new AppError(
        status.BAD_REQUEST,
        `Open time must be before close time for day ${hour.dayOfWeek}`,
      );
    }
  }

  //  Check duplicate dayOfWeek
  const days = hours.map((hour) => hour.dayOfWeek);

  const uniqueDays = new Set(days);

  if (uniqueDays.size !== days.length) {
    throw new AppError(
      status.BAD_REQUEST,
      "Duplicate dayOfWeek is not allowed",
    );
  }

  //  Replace old hours with new hours
  const result = await prisma.$transaction(async (tx) => {
    await tx.resourceHours.deleteMany({
      where: {
        resourceId,
      },
    });

    await tx.resourceHours.createMany({
      data: hours.map((hour) => ({
        resourceId,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
    });

    return tx.resourceHours.findMany({
      where: {
        resourceId,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });
  });

  return result;
};

const deleteResource = async (resourceId: string) => {
  //  Check resource exists
  const existingResource = await prisma.resource.findUnique({
    where: {
      id: resourceId,
    },
  });

  if (!existingResource) {
    throw new AppError(
      status.NOT_FOUND,
      "Resource not found"
    );
  }

  //  Already inactive
  if (!existingResource.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      "Resource is already deleted"
    );
  }

  // Soft delete
  await prisma.resource.update({
    where: {
      id: resourceId,
    },
    data: {
      isActive: false,
    },
  });

  return {massage:"Resource delete successfully"};
};
export const resourceService = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  updateResourceHours,
  deleteResource
};
