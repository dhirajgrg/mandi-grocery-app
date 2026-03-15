import nodemailer from "nodemailer";
import Mailgen from "mailgen";

class SendEmail {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  //   1. CREATE TRANSPORTER
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  // GENERATE EMAIL TEMPLATE FROM MAILGEN
  generateTemplate(intro, buttonText) {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Mandi",
        link: process.env.FRONTEND_URL || "http://localhost:5173",
      },
    });

    const email = {
      body: {
        name: this.name,
        intro: intro,
        action: {
          instructions: "Click the button below:",
          button: {
            color: "#22BC66",
            text: buttonText,
            link: this.url,
          },
        },
        outro: "If you did not request this email, ignore it.",
      },
    };

    return mailGenerator.generate(email);
  }

  //   3. SEND EMAIL
  async send(subject, intro, buttonText) {
    const transporter = this.newTransport();

    const html = this.generateTemplate(intro, buttonText);

    await transporter.sendMail({
      from: this.from,
      to: this.to,
      subject,
      html,
    });
  }

  //WELCOME EMAIL SEND
  async sendWelcome() {
    await this.send(
      "Welcome to Mandi",
      "We're excited to have you on board! Explore fresh groceries and great deals.",
      "Visit Dashboard",
    );
  }
  // EMAIL VERIFICATION SEND MAIL
  async sendVerification() {
    await this.send(
      "Welcome to Mandi — Verify your email",
      "Welcome to Mandi! Please verify your email address to get started.",
      "Verify Email",
    );
  }

  //   RESET PASSWORD SEND MAIL
  async sendPasswordReset() {
    await this.send(
      "Mandi — Reset your password",
      "You requested a password reset.",
      "Reset Password",
    );
  }
}

export default SendEmail;
