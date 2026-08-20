import config from "../../config";
import { BkashIdToken } from "../../lib/bkash";

const bookAppontment = async () => {
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
				payerReference: "01723888888",
				callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
				merchantAssociationInfo: "MI05MID54RF09123456One",
				amount: "500",
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: "Inv0124",
			}),
		},
	);
	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

	console.log({ bkashCreatePaymentResult });

	return bkashCreatePaymentResult;
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
};
