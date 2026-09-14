import { prisma } from "../../lib/prisma";
import { ResourceData } from "./resources.interface";

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

export const resourceService = {
  createResource,
};
