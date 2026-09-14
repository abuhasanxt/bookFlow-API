import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { resourceService } from "./resources.service";
import status from "http-status";

const createResource = catchAsync(async (req: Request, res: Response) => {
  const result = await resourceService.createResource(req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Resource created successfully",
    data: result,
  });
});

export const resourceController = {
  createResource,
};
