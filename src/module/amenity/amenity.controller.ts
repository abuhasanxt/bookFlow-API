import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { amenityService } from "./amenity.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createAmenity = catchAsync(async (req: Request, res: Response) => {
  const result = await amenityService.createAmenity(req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Amenity create successful.",
    data: result,
  });
});

export const amenityController = {
  createAmenity,
};
