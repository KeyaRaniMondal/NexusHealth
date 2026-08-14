import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequests";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./authValidation";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.PatientRegistrationZodSchema),
	AuthController.registerPatient,
);
router.post(
	"/verify-email",
	validateRequest(UserValidation.PatientEmailVerifyZodSchema),
	AuthController.verifyPatientEmail,
);
router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);
router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);
router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);
router.get(
	"/me",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	// validateRequest
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);
export const AuthRoutes = router;
