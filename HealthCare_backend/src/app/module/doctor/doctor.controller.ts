import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { ApplyAsDoctorValidationZodSchema } from "./doctor.validation";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { DoctorServices } from "./doctor.service";

const applyAsDoctor = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	console.log({ files });
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];
	const zodValidationResult = ApplyAsDoctorValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new Error(zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

	const result = await DoctorServices.applyAsDoctor(
		payload,
		resume,
		additionalFiles,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied As Doctor Successfuly",
		data: result,
	});
});

export const DoctorController = {
	applyAsDoctor,
};
