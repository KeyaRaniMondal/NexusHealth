import { catchAsync } from "../../utils/catchAsync";
import { Response, Request } from "express";
import { AppointmentServices } from "./appointment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
	const result = await AppointmentServices.bookAppontment();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const bookAppointmentCallback = catchAsync(
	async (req: Request, res: Response) => {
		console.log(req.query, "req.query");
		const { executedPaymentResult, redirectUrl } =
			await AppointmentServices.bookAppointmentCallback(req.query);

		console.log({ executedPaymentResult }, "callback controller");

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
};
