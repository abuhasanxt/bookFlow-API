import express from "express"
import { authController } from "./auth.controller"
import { checkAuth } from "../../middleware/checkAuth"
import { Role } from "../../../generated/prisma/enums"

const router=express.Router()
router.post("/register",authController.register)
router.post("/login",authController.login)
router.get("/me",checkAuth(Role.USER,Role.ADMIN), authController.getMe)

export const authRoutes=router