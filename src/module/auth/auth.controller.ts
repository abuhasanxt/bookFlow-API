import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const register =catchAsync(async(req:Request,res:Response)=>{
    const result=await authService.register(req.body);
    sendResponse(res,{
        success:true,
        httpStatusCode:status.CREATED,
        message:"Registration successful. Please check your email for the OTP and verify your email.",
        data:result
    })
})

const login=catchAsync(async(req:Request,res:Response)=>{
    const result=await authService.login(req.body)
    sendResponse(res,{
        success:true,
        httpStatusCode:status.OK,
        message:"Login successfully",
        data:result
    })
})

export const authController={
    register,
    login
}