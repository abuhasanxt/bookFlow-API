import express from 'express';
import { authRoutes } from '../module/auth/auth.route';
import { googleLoginRoutes } from '../module/auth/googleLogin.route';
import { amenityRoutes } from '../module/amenity/amenity.route';
const router = express.Router();
router.use("/auth",authRoutes)
router.use("/api/auth",googleLoginRoutes)
router.use("/amenities",amenityRoutes)

export const indexRoutes=router