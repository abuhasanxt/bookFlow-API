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

const verifyEmail=catchAsync(async(req:Request,res:Response)=>{
  const result=await authService.verifyEmail(req.body)
  const {accessToken,refreshToken,...rest}=result
  tokenUtils.setAccessTokenCookie(res,accessToken);
  tokenUtils.setRefreshTokenCookie(res,refreshToken)

  sendResponse(res,{
    success:true,
    httpStatusCode:status.OK,
    message:result.message,
    data:{
      accessToken,
      refreshToken,
      ...rest
    }
  })
})

const getNewToken=catchAsync(async(req:Request,res:Response)=>{
  const refreshToken=req.cookies.refreshToken
  const result=await authService.getNewToken(refreshToken)
  const {newAccessToken,newRefreshToken}=result;
  tokenUtils.setAccessTokenCookie(res,newAccessToken)
  tokenUtils.setRefreshTokenCookie(res,newRefreshToken);
  sendResponse(res,{
    success:true,
    httpStatusCode:status.CREATED,
    message:"New tokens generate successfully",
    data:{
      newAccessToken,
      newRefreshToken
    }
  })
})

const logout=catchAsync(async(req:Request,res:Response)=>{
  tokenUtils.clearAccessTokenCookie(res)
  tokenUtils.clearRefreshTokenCookie(res)
  
  const result=await authService.logOut()
   sendResponse(res,{
    success:true,
    httpStatusCode:status.OK,
    message:result.message,
  })

})
const updateMe=catchAsync(async(req:Request,res:Response)=>{
  const userId=req.user.userId
  if (!userId) {
    throw new AppError(status.UNAUTHORIZED,"You are unauthorized")
  }
const payload={
  ...JSON.parse(req.body.data),
  image:req.file?.path
}
  const result=await authService.updateMe(userId,payload)

  sendResponse(res,{
    success:true,
    httpStatusCode:status.OK,
    message:"Profile update successfully",
    data:result
  })
})
export const authController={
    register,
    login,
    getMe,
    verifyEmail,
    updateMe,
    getNewToken,
    logout
}