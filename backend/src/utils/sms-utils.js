// Mock SMS utility — replace with real provider (e.g. Sparrow SMS, Aakash SMS) later
export const sendSMS = async (mobile, message) => {
  const fullNumber = `+977${mobile}`;
  console.log(`\n📱 [SMS → ${fullNumber}] ${message}\n`);
  return { success: true, to: fullNumber, message };
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

export const sendOTP = async (mobile, otp) => {
  return sendSMS(
    mobile,
    `Your Mandi verification code is: ${otp}. Valid for 10 minutes.`,
  );
};

export const sendWelcomeSMS = async (mobile, name) => {
  return sendSMS(
    mobile,
    `Welcome to Mandi, ${name}! 🎉 Start shopping fresh groceries now.`,
  );
};
