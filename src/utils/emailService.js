import { transporter } from "../config/emailConfig.js";

export const sendApprovalEmail = async (userEmail, businessName, status) => {
  const isApproved = status === "active";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const logoUrl =
    "https://res.cloudinary.com/vinhhv28/image/upload/v1773167610/duqmiuefjinpfugim6or.png";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      
      <div style="background-color: #a5190e; padding: 35px 20px; text-align: center;">
        <a href="${frontendUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="${logoUrl}" 
               alt="VivuViet" 
               width="220" 
               style="display: block; border: 0; width: 220px; max-width: 100%; height: auto; margin: 0 auto;" />
        </a>
        <p style="color: #ffffff; margin: 15px 0 0 0; letter-spacing: 3px; font-size: 11px; text-transform: uppercase; font-family: sans-serif; opacity: 0.9;">
          Đồng hành du lịch Việt
        </p>
      </div>

      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #a5190e; margin-top: 0; margin-bottom: 20px; font-size: 20px;">
          Kính chào ${businessName},
        </h2>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">
          Cảm ơn bạn đã tin tưởng và đăng ký trở thành đối tác của <b>VivuViet</b>. Chúng tôi đã xem xét hồ sơ và giao dịch của bạn.
        </p>

        <div style="margin: 30px 0; padding: 25px; border-radius: 12px; text-align: center; background-color: ${isApproved ? "#f6ffed" : "#fff2f0"}; border: 1px solid ${isApproved ? "#b7eb8f" : "#ffccc7"};">
          <span style="display: block; font-size: 13px; color: #666; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px;">
            Trạng thái hồ sơ
          </span>
          <strong style="font-size: 22px; color: ${isApproved ? "#52c41a" : "#ff4d4f"}; font-family: Arial, sans-serif;">
            ${isApproved ? "ĐÃ ĐƯỢC KÍCH HOẠT" : "CHƯA ĐƯỢC PHÊ DUYỆT"}
          </strong>
        </div>

        ${
          isApproved
            ? `
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Tài khoản của bạn đã sẵn sàng. Bạn có thể bắt đầu đăng tải các dịch vụ, bài viết và tiếp cận hàng ngàn du khách ngay từ bây giờ.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="${frontendUrl}/login" 
               style="background-color: #f7bd01; color: #a5190e; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; border: 1px solid #d4a302;">
               TRUY CẬP DASHBOARD
            </a>
          </div>
        `
            : `
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Rất tiếc, hồ sơ của bạn hiện tại chưa được phê duyệt. Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ với chúng tôi để được hỗ trợ trực tiếp.
          </p>
        `
        }
      </div>

      <div style="background-color: #f9f9f9; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #999; margin: 0; line-height: 1.5;">
          Email này được gửi tự động từ hệ thống quản trị <b>VivuViet</b>.<br/>
          Nếu có thắc mắc, vui lòng phản hồi qua email: 
          <a href="mailto:${process.env.EMAIL_USER}" style="color: #a5190e; text-decoration: none;">${process.env.EMAIL_USER}</a>
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"VivuViet Admin" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: isApproved
      ? `[VivuViet] Chúc mừng! Tài khoản đối tác của bạn đã được kích hoạt`
      : `[VivuViet] Thông báo về hồ sơ đối tác`,
    html: htmlContent,
  };
  return transporter.sendMail(mailOptions);
};
