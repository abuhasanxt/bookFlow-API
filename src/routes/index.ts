import express from 'express';
import { authRoutes } from '../module/auth/auth.route';
import { googleLoginRoutes } from '../module/auth/googleLogin.route';
import { amenityRoutes } from '../module/amenity/amenity.route';
import { resourceRoutes } from '../module/resources/resources.route';
import { bookingRoutes } from '../module/bookings/booking.route';
const router = express.Router();
router.use("/auth",authRoutes)
router.use("/api/auth",googleLoginRoutes)
router.use("/amenities",amenityRoutes)
router.use("/resources",resourceRoutes)
router.use("/bookings",bookingRoutes)

export const indexRoutes=router