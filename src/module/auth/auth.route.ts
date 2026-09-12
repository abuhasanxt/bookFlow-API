import express from "express"
import { authController } from "./auth.controller"
import { checkAuth } from "../../middleware/checkAuth"
import { Role } from "../../../generated/prisma/enums"
import { multerUpload } from "../../config/multer.config"

const router=express.Router()
router.post("/register",authController.register)
router.post("/login",authController.login)
router.post("/email-verify",authController.verifyEmail)
router.post("/refresh",authController.getNewToken)
router.post("/logout",checkAuth(),authController.logout)
router.get("/me",checkAuth(Role.USER,Role.ADMIN), authController.getMe)
router.patch("/me",checkAuth(),multerUpload.single("image"),authController.updateMe)

export const authRoutes=router