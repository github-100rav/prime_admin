import nodemailer from "nodemailer";

const sendMail = async (
  emailsData: string[] | string,
  subject: string,
  html: string
) => {
  try {
    const recipientList = Array.isArray(emailsData) ? emailsData : [emailsData];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: recipientList.join(","),
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true, message: "Email sent successfully!" };
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message || error);
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
};

export default sendMail;
