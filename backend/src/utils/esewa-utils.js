import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// eSewa v2 test credentials
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_PAYMENT_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Generate HMAC-SHA256 signature for eSewa v2.
 */
export const generateEsewaSignature = (message) => {
  return crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
};

/**
 * Build the form payload that gets submitted to eSewa's payment page.
 */
export const buildEsewaFormData = (totalAmount) => {
  const transactionUuid = uuidv4();

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = generateEsewaSignature(signatureMessage);

  return {
    formData: {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${FRONTEND_URL}/payment/success`,
      failure_url: `${FRONTEND_URL}/payment/failure`,
      signed_field_names: signedFieldNames,
      signature,
    },
    transactionUuid,
    paymentUrl: ESEWA_PAYMENT_URL,
  };
};

/**
 * Decode and verify the base64-encoded response eSewa sends back.
 * Returns the parsed data on success, throws on failure.
 */
export const verifyEsewaResponse = (encodedData) => {
  const decoded = JSON.parse(
    Buffer.from(encodedData, "base64").toString("utf-8"),
  );

  const { status, signed_field_names, signature } = decoded;

  if (status !== "COMPLETE") {
    throw new Error("Payment was not completed");
  }

  // Rebuild signature from signed fields and compare
  const signedFields = signed_field_names?.split(",") || [];
  const message = signedFields
    .map((field) => `${field}=${decoded[field]}`)
    .join(",");
  const expectedSignature = generateEsewaSignature(message);

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  return decoded;
};
