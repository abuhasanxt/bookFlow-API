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


const getAmenity=catchAsync(async (req: Request, res: Response) => {
  const result = await amenityService.getAmenity();
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Get Amenities successful.",
    data: result,
  });
});

const updateAmenity=catchAsync(async (req: Request, res: Response) => {
    const id=req.params.id
  const result = await amenityService.updateAmenity(id as string,req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Update Amenity successful.",
    data: result,
  });
});
export const amenityController = {
  createAmenity,
  getAmenity,
  updateAmenity
};
