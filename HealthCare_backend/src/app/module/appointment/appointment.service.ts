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

export const AppointmentServices = {
	bookAppontment,
};
