export type TelegramInvoice = {
  title: string;
  description: string;
  payload: string;
  currency: "XTR";
  prices: Array<{
    label: string;
    amount: number;
  }>;
};

export type TelegramSuccessfulPayment = {
  currency: "XTR";
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
};

export function buildCaseInvoice(
  caseId: string,
  priceStars: number
): TelegramInvoice {
  if (!caseId) {
    throw new Error("CASE_ID is required");
  }

  if (!Number.isInteger(priceStars) || priceStars <= 0) {
    throw new Error("PRICE_STARS must be a positive integer");
  }

  return {
    title: "Последнее сообщение",
    description: "Полный доступ к расследованию.",
    payload: `case:${caseId}`,
    currency: "XTR",
    prices: [
      {
        label: "Доступ к CASE",
        amount: priceStars,
      },
    ],
  };
}

export function isSuccessfulCasePayment(
  payment: TelegramSuccessfulPayment,
  caseId: string
): boolean {
  return (
    payment.currency === "XTR" &&
    payment.invoice_payload === `case:${caseId}` &&
    payment.total_amount > 0 &&
    Boolean(payment.telegram_payment_charge_id)
  );
}
