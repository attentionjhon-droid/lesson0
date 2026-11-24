import nodemailer from "nodemailer";

interface SendFeedbackEmailParams {
  name: string;
  email: string;
  message: string;
}

export async function sendFeedbackEmail({
  name,
  email,
  message,
}: SendFeedbackEmailParams): Promise<{ success: boolean; error?: string }> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const targetEmail = process.env.FEEDBACK_TARGET_EMAIL || "attentionjhon@gmail.com";

  if (!emailUser || !emailPass) {
    console.warn(
      "[EMAIL WARNING] .env faylida EMAIL_USER va EMAIL_PASS kiritilmagan. Sharh bazaga saqlandi, lekin SMTP email jo'natilmadi."
    );
    return {
      success: false,
      error: "EMAIL_USER va EMAIL_PASS .env faylida sozlanmagan",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"NDTU Coding Platform" <${emailUser}>`,
      to: targetEmail,
      subject: `[NDTU Coding Platform] Yangi Taklif / Sharh: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 20px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">NDTU Coding Platform - Yangi Sharh</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Foydalanuvchidan taklif yoki fikr-mulohaza kelib tushdi</p>
            </div>
            
            <div style="padding: 24px;">
              <div style="margin-bottom: 16px;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Yuboruvchi ismi:</span>
                <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 4px;">${name}</div>
              </div>

              <div style="margin-bottom: 16px;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Aloqa uchun Email / Foydalanuvchi:</span>
                <div style="font-size: 14px; color: #0284c7; margin-top: 4px;">${email}</div>
              </div>

              <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Sharh / Taklif matni:</span>
                <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin-top: 6px; white-space: pre-wrap; color: #334155;">${message}</div>
              </div>

              <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Ushbu xabar NDTU Coding Platform (http://localhost:3000) orqali avtomatik yuborildi.
              </div>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Email send error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
