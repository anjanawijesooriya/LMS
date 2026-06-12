const cron = require("node-cron");
const User = require("../models/auth");
const sendEmail = require("./sendEmail");

const alertAdmin = async (jobName, error) => {
  if (!process.env.ADMIN_EMAIL) return;
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[Devians LMS] Cron Job Failed: ${jobName}`,
      html: `<h2>Cron Job Failure Alert</h2><p><strong>Job:</strong> ${jobName}</p><pre>${error?.stack || error}</pre>`,
    });
  } catch (e) {
    console.error("Failed to send cron failure alert email:", e);
  }
};

const resetExpiredMemberships = () => {
  // Run at midnight every day
  cron.schedule("0 0 * * *", async () => {
    try {
      const currentDate = new Date();

      const users = await User.find({
        "membership.status": { $ne: "pending" },
        "membership.expiryDate": { $lt: currentDate },
        "membership.expiryNotified": { $ne: true },
      });

      for (let user of users) {
        user.membership.status = "pending";
        user.membership.expiryDate = null;
        user.membership.expiryNotified = true;
        await user.save();

        const message = `
          <h1>Membership Expired ⌛</h1>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your membership has expired. Please make your payment to regain access to your classes via Devians LMS.</p>
          <p>If you need further assistance, please contact our support team.</p>
          <br>
          <strong>Devians LMS Team</strong>
        `;

        try {
          await sendEmail({
            to: user.email,
            subject: "Membership Expired - Devians LMS",
            html: message,
          });
        } catch (emailError) {
          console.error(`Failed to send expiry email to ${user.email}:`, emailError);
        }

        console.log(`Membership expired and notification sent: ${user.email}`);
      }

      if (users.length > 0) {
        console.log(`Membership expiry processed for ${users.length} user(s).`);
      }
    } catch (error) {
      console.error("Cron: Error updating membership status:", error);
      await alertAdmin("resetExpiredMemberships", error);
    }
  });

  console.log("Cron job registered: membership expiry check (daily midnight).");
};

module.exports = resetExpiredMemberships;
