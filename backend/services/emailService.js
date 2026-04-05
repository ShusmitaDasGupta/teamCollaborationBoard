const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // For production: use your real email service (Gmail, SendGrid, etc.)
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Use Gmail App Password, not your real password
      }
    });
  }

  // For development: use Ethereal (fake SMTP, emails appear in console)
  return null; // Will be created async below
};

// Send invitation email
exports.sendInvitationEmail = async ({ toEmail, inviterName, boardTitle, inviteLink }) => {
  try {
    let transporter;

    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER) {
      // Use real Gmail in production
      transporter = createTransporter();
    } else {
      // Use Ethereal test account in development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: `"CollabBoard" <${process.env.EMAIL_USER || 'noreply@collabboard.com'}>`,
      to: toEmail,
      subject: `${inviterName} invited you to join "${boardTitle}" on CollabBoard`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background:#f8fafc; font-family: 'Inter', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:white; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e1b4b, #4f46e5); padding: 36px 40px; text-align:center;">
                      <div style="font-size:36px; margin-bottom:12px;">🚀</div>
                      <h1 style="color:white; margin:0; font-size:24px; font-weight:700; letter-spacing:-0.5px;">CollabBoard</h1>
                      <p style="color:rgba(255,255,255,0.7); margin:8px 0 0; font-size:14px;">Team Collaboration Made Easy</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color:#1e293b; font-size:20px; margin:0 0 16px; font-weight:600;">
                        You've been invited! 🎉
                      </h2>

                      <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 20px;">
                        <strong style="color:#1e293b;">${inviterName}</strong> has invited you to collaborate on the board:
                      </p>

                      <!-- Board name box -->
                      <div style="background:#f1f5f9; border-left:4px solid #6366f1; border-radius:8px; padding:16px 20px; margin:0 0 28px;">
                        <div style="font-size:13px; color:#64748b; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Board</div>
                        <div style="font-size:18px; font-weight:700; color:#1e293b;">📋 ${boardTitle}</div>
                      </div>

                      <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 28px;">
                        Click the button below to accept the invitation and join the board. This invitation link will expire in <strong>7 days</strong>.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align:center; margin:0 0 28px;">
                        <a href="${inviteLink}" 
                           style="display:inline-block; background:#6366f1; color:white; text-decoration:none; 
                                  padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600;
                                  letter-spacing:0.2px; box-shadow: 0 4px 12px rgba(99,102,241,0.35);">
                          Accept Invitation →
                        </a>
                      </div>

                      <!-- Alt link -->
                      <p style="color:#94a3b8; font-size:12px; text-align:center; margin:0 0 8px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color:#6366f1; font-size:12px; text-align:center; word-break:break-all; margin:0;">
                        ${inviteLink}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc; padding:24px 40px; border-top:1px solid #e2e8f0; text-align:center;">
                      <p style="color:#94a3b8; font-size:12px; margin:0 0 6px;">
                        If you weren't expecting this invitation, you can safely ignore this email.
                      </p>
                      <p style="color:#94a3b8; font-size:12px; margin:0;">
                        © 2025 CollabBoard. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        ${inviterName} invited you to join "${boardTitle}" on CollabBoard.
        
        Click the link below to accept:
        ${inviteLink}
        
        This link expires in 7 days.
        
        If you weren't expecting this, ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);

    // In development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('📧 Invite link:', inviteLink);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error('Failed to send invitation email');
  }
};
