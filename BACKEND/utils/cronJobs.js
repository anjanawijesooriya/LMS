const cron = require("node-cron");
const User = require("../models/auth");
const sendEmail = require("./sendEmail");

// Define the cron job to reset expired memberships
const resetExpiredMemberships = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      // Get the current date
      const currentDate = new Date();

      // Find all users with expired memberships and whose expiryDate is before today
      const users = await User.find({
        "membership.status": { $ne: "pending" }, // Only process users whose status isn't "pending"
        "membership.expiryDate": { $lt: currentDate },
      });

      // Update users whose membership has expired
      for (let user of users) {
        user.membership.status = "pending";
        user.membership.expiryDate = null;
        await user.save();
        console.log(
          `User ${user.email}'s membership has been reset to pending.`
        );

        // Send email notification
        const message = `
            <h1>Membership Expired ⌛</h1>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Your membership has expired ⌛. Please make your necessary payments to regain your membership via Devians LMS</p>
            <p>If you need further assistance, please contact our support team.</p>
            <br>
            <strong>Devians LMS Team</strong>
          `;

        await sendEmail({
          to: user.email,
          subject: "Membership Expired - Devians LMS",
          html: message,
        });
      }

      console.log("Membership status updated for all expired users.");
    } catch (error) {
      console.error("Error updating membership status:", error);
    }
  });

  console.log("Cron job set up to reset memberships.");
};

// Export the cron job function
module.exports = resetExpiredMemberships;
