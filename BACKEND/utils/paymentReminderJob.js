const cron = require("node-cron");
const User = require("../models/auth");
const sendEmail = require("./sendEmail");

const sendPaymentReminders = () => {
  // Run at 9:00 AM every day
  cron.schedule("0 9 * * *", async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      // Last day of current month
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysUntilEnd = Math.ceil((lastDay - now) / (1000 * 60 * 60 * 24));

      // Send reminder 3 days before end of month
      if (daysUntilEnd !== 3) return;

      // Find students with pending or expired membership
      const students = await User.find({
        role: "student",
        "membership.status": { $in: ["pending", "expired"] },
      });

      const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December",
      ];
      const nextMonthName = monthNames[(currentMonth + 1) % 12];
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      for (let student of students) {
        const message = `
          <h1>Payment Reminder 🔔</h1>
          <p>Hello ${student.firstName} ${student.lastName},</p>
          <p>This is a friendly reminder that your Devians LMS membership needs to be renewed.</p>
          <p>Please submit your payment for <strong>${nextMonthName} ${nextMonthYear}</strong> to continue accessing your classes without interruption.</p>
          <p>Your membership is currently <strong>${student.membership.status}</strong>.</p>
          <p>Login to your account and go to the <strong>Enroll</strong> page to submit your payment details.</p>
          <br>
          <strong>Devians LMS Team</strong>
        `;

        await sendEmail({
          to: student.email,
          subject: `Payment Reminder for ${nextMonthName} ${nextMonthYear} - Devians LMS`,
          html: message,
        });
      }

      if (students.length > 0) {
        console.log(`Payment reminders sent to ${students.length} student(s).`);
      }
    } catch (error) {
      console.error("Cron: Error sending payment reminders:", error);
    }
  });

  console.log("Cron job registered: payment reminders (daily 9AM check).");
};

module.exports = sendPaymentReminders;
