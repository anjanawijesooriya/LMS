const resetPasswordTemplate = (resetURL) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #555;">
        We received a request to reset your password. Click the button below to set a new password:
      </p>
      
      <!-- Bulletproof Button -->
      <table cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
          <td align="center" bgcolor="#007bff" style="border-radius: 5px;">
            <a href="${resetURL}" target="_blank"
               style="display: block; font-size: 16px; color: #ffffff; background-color: #007bff;
                      text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;
                      border: 1px solid #007bff; text-align: center;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <p style="color: #888; margin-top: 20px;">
        If you did not request this, please ignore this email. This link will expire in 30 minutes.
      </p>
      
      <p style="color: #555;">Best Regards, <br> Devians LMS Team</p>

      <p style="color: #777; font-size: 12px;">
        Or copy and paste this link in your browser: <br>
        <a href="${resetURL}" target="_blank" style="color: #007bff; word-break: break-all; cursor: pointer;">${resetURL}</a>
      </p>
    </div>
  `;
};

module.exports = resetPasswordTemplate;
