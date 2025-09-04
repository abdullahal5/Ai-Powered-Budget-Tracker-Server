import nodemailer from "nodemailer";

export const emailSender = async (email: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "abdullahalfahin183@gmail.com",
        pass: "njvx iwhw wdnm mxqo",
      },
    });

    try {
      await transporter.verify();
    } catch (error) {
      console.error("❌ SMTP verification failed:", error);
      throw error;
    }

    await transporter.sendMail({
      from: '"My Wallet" <abdullahalfahin183@gmail.com>',
      to: email,
      subject: "Monthly Budget Expense Alert",
      text: "",
      html,
    });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    throw new Error("Failed to send email.");
  }
};
