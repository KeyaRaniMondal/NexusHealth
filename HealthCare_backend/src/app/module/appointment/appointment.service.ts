import { AppionementStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { BkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";

const bookAppontment = async (payload: any, user: RequestUser) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const appointment = await tx.appointment.create({
			data: {
				status: AppionementStatus.PENDING,
			},
		});
		const bkashIDToken = await BkashIdToken();

		if (!bkashIDToken) throw new Error("No bkash id token found");

		const bkashCreatePaymentResponse = await fetch(
			`${config.bkash_api_base_url}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIDToken,
					"X-App-Key": config.bkash_app_key,
				},

				body: JSON.stringify({
					mode: "0011",
					// payerReference: "01723888888",
					payReference: user.email,
					callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
					merchantAssociationInfo: "MI05MID54RF09123456One",
					amount: "500",
					currency: "BDT",
					intent: "sale",
					// merchantInvoiceNumber: "Inv0124",
					merchantInvoiceNumber: appointment.id,
				}),
			},
		);
		const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

		await tx.payment.create({
			data: {
				merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
				appointmentId: appointment.id,
				amount: "500",
				gatewayResponse: bkashCreatePaymentResult,
				bkashPaymentId: bkashCreatePaymentResult.paymentId,
				payerReference: user.email,
			},
		});

		return {
			paymentUrl: bkashCreatePaymentResult.bkashURL,
		};
	});
	return transactionResult;
};

const Payment_for_appointment_completion = async (
	payload: any,
	user: RequestUser,
) => {
	const appointmentId = payload.appointmentId;

	const existingAppointment = await prisma.appointment.findUnique({
		where: {
			id: appointmentId,
		},
	});
	if (!existingAppointment) {
		throw new Error("Appointment Does Not Exists");
	}

	if (existingAppointment.status !== "PENDING") {
		throw new Error("Appointment Is Not Pending!");
	}

	// if (existingAppointment.status === "CANCELLED" || existingAppointment.status === "ONGOING" || existingAppointment.status === "COMPLETED"){
	//     const appointmentStatus = existingAppointment.status
	//     throw new Error(`Appointment is already ${appointmentStatus.toLowerCase}`)
	// }

	const bkashIDToken = await BkashIdToken();
	if (!bkashIDToken) throw new Error("No Bkash Access Token Found");

	const bkashCreatePaymentResponse = await fetch(
		`${config.bkash_api_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIDToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				mode: "0011",
				// payerReference: "0123456789", //user email or phone number
				payerReference: user.email, //user email or phone number
				callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
				amount: "1200",
				currency: "BDT",
				intent: "sale",
				// merchantInvoiceNumber: "Inv4" // apppointment id
				merchantInvoiceNumber: existingAppointment.id, // apppointment id
			}),
		},
	);
	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();
	await prisma.payment.update({
		where: {
			appointmentId: existingAppointment.id,
		},
		data: {
			merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
			gatewayResponse: bkashCreatePaymentResult,
			bkashPaymentId: bkashCreatePaymentResult.paymentID,
		},
	});
	return {
		paymentUrl: bkashCreatePaymentResult.bkashURl,
	};
};

const bookAppointmentCallback = async (query: Record<string, any>) => {
	const paymentId = query.paymentId;
	if (!paymentId) throw new Error("payment id is missing");

	const status = query.status;
	if (!status) throw new Error("payment status is missing");

	const bkashIdToken = await BkashIdToken();
	if (!bkashIdToken) throw new Error("no bkash access token found");

	const executedPaymentResponse = await fetch(
		`${config.bkash_api_base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash_app_key,
			},

			body: JSON.stringify({
				paymentID: paymentId,
			}),
		},
	);

	const executedPaymentResult = await executedPaymentResponse.json();

	if (status === "success") {
		return {
			executedPaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
		};
	}
	if (status === "failure") {
		return {
			executedPaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failue`,
		};
	}
	if (status === "cancel") {
		return {
			executedPaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
		};
	}

	return {
		executedPaymentResult,
		redirectUrl: `${config.frontend_url}/dashboard/my-appointments`,
	};
};

export const AppointmentServices = {
	bookAppontment,
	bookAppointmentCallback,
	Payment_for_appointment_completion,
};
