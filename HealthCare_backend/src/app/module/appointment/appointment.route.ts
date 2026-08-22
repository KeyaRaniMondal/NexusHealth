import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post("/book-appointment", AppointmentController.bookAppointment);
router.post(
	"/payment-for-appointment",
	auth(Role.PATIENT),
	AppointmentController.Payment_for_appointment_completion,
);
router.get(
	"/book-appointment/payment/callback",
	AppointmentController.bookAppointmentCallback,
);

export const AppointmentRoutes = router;
