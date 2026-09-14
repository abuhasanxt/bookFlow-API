import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { resourceService } from "./resources.service";
import status from "http-status";
import { GetResourcesQuery } from "./resources.interface";

const createResource = catchAsync(async (req: Request, res: Response) => {
  const result = await resourceService.createResource(req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Resource created successfully",
    data: result,
  });
});

const getResources = catchAsync(async (req: Request, res: Response) => {
  const query: GetResourcesQuery = {
    type: req.query.type as GetResourcesQuery["type"],

    minCapacity: req.query.minCapacity
      ? Number(req.query.minCapacity)
      : undefined,

    amenity: req.query.amenity as string | undefined,

    availableFrom: req.query.availableFrom as string | undefined,

    availableTo: req.query.availableTo as string | undefined,

    sortBy: req.query.sortBy as GetResourcesQuery["sortBy"],

    sortOrder: req.query.sortOrder as GetResourcesQuery["sortOrder"],

    page: req.query.page ? Number(req.query.page) : undefined,

    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };

  const result = await resourceService.getResources(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Resources retrieved successfully",
    data: result,
  });
});
export const resourceController = {
  createResource,
  getResources,
};
