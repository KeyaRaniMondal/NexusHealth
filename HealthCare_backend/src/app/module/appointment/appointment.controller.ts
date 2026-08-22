import { catchAsync } from "../../utils/catchAsync";
import { Response, Request } from "express";
import { AppointmentServices } from "./appointment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await AppointmentServices.bookAppontment(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Appointment payment Initiated Successfully",
		data: result,
	});
});

const Payment_for_appointment_completion = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;

		const result = await AppointmentServices.bookAppontment(payload, user);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment payment Initiated Successfully",
			data: result,
		});
	},
);

const bookAppointmentCallback = catchAsync(
	async (req: Request, res: Response) => {
		const { redirectUrl } = await AppointmentServices.bookAppointmentCallback(
			req.query,
		);
		res.redirect(redirectUrl);
		// sendResponse(res, {
		//     statusCode: httpStatus.OK,
		//     success: true,
		//     message: "User profile fetched successfully",
		//     data: result,
		// });
	},
);

export const AppointmentController = {
	bookAppointment,
	bookAppointmentCallback,
	Payment_for_appointment_completion,
};
