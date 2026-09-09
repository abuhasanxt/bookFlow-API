import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";

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
    const {accessToken,refreshToken,...rest}=result;
    tokenUtils.setAccessTokenCookie(res,accessToken)
    tokenUtils.setRefreshTokenCookie(res,refreshToken)
    sendResponse(res,{
        success:true,
        httpStatusCode:status.OK,
        message:"Login successfully",
        data:{
            accessToken,
            refreshToken,
            ...rest
        }
    })
})

const getMe=catchAsync(async(req:Request,res:Response)=>{
  const userId=req.user.userId
  if (!userId) {
    throw new AppError(status.UNAUTHORIZED,"You are unauthorized")
  }
  const result=await authService.getMe(userId)
  sendResponse(res,{
    success:true,
    httpStatusCode:status.OK,
    message:"Get my profile",
    data:result
  })
})
export const authController={
    register,
    login,
    getMe
}