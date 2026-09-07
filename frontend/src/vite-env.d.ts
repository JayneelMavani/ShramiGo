/// <reference types="vite/client" />

interface RazorpayCheckoutOptions {
	key: string;
	amount: number;
	currency: string;
	name: string;
	description: string;
	order_id: string;
	handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
	modal?: { ondismiss?: () => void };
}

interface RazorpayCheckout {
	open(): void;
}

interface Window {
	Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
}
