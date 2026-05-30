const User = require("../models/auth");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const resetPasswordTemplate = require("../utils/emailTemplates/resetPasswordTemplate");

// Register Student
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, grade, telephoneNumber } = req.body;

  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      grade,
      telephoneNumber,
    });

    const message = `
      <h1>Welcome to Devians LMS 🎉</h1>
      <p>Hello ${firstName} ${lastName},</p>
      <p>Your account has been successfully created! You can now log in to our online learning platform.</p>
      <p><strong>Student ID:</strong> ${user.studentId}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Grade:</strong> ${grade}</p>
      <p>Thank you for joining us!</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    await sendEmail({
      to: user.email,
      subject: "Welcome to Devians LMS",
      html: message,
    });

    sendToken(user, 201, res);
  } catch (error) {
    handleError(error, res);
  }
};

// Register Admin/Teacher
exports.registerStaff = async (req, res) => {
  const { firstName, lastName, email, password, role, grade, telephoneNumber } = req.body;

  try {
    if (!["admin", "teacher"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      grade: grade || "N/A",
      telephoneNumber: telephoneNumber || "0000000000",
    });

    sendToken(user, 201, res);
  } catch (error) {
    handleError(error, res);
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please enter email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist. Please register first.",
      });
    }

    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Forgot Password
exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/passwordreset/${resetToken}`;
    const emailTemplate = resetPasswordTemplate(resetURL);

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Devians LMS",
        html: emailTemplate,
      });
      res.status(200).json({ success: true, message: "Reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetpassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    handleError(error, res);
  }
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Edit User
exports.editUser = async (req, res) => {
  const { firstName, lastName, email, grade, telephoneNumber, profilePhoto } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, grade, telephoneNumber, ...(profilePhoto !== undefined && { profilePhoto }) },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, updatedUser });
  } catch (error) {
    handleError(error, res);
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userEmail = user.email;
    const userName = `${user.firstName} ${user.lastName}`;

    await User.findByIdAndDelete(req.params.id);

    const message = `
      <h1>Account Deleted ✅</h1>
      <p>Hello ${userName},</p>
      <p>Your account has been successfully deleted. You will need to register again to access our platform.</p>
      <p>Thank you for being with us!</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    try {
      await sendEmail({ to: userEmail, subject: "Your Account Has Been Deleted - Devians LMS", html: message });
    } catch (emailError) {
      console.error("Error sending deletion email:", emailError);
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Approve / Unapprove user
exports.toggleApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ success: true, isApproved: user.isApproved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Send Token Helper
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      grade: user.grade,
      telephoneNumber: user.telephoneNumber,
      studentId: user.studentId,
      membership: user.membership,
      isApproved: user.isApproved,
      profilePhoto: user.profilePhoto,
    },
  });
};

// Error Handler
const handleError = (error, res) => {
  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: "Email already exists" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map((val) => val.message),
    });
  }
  res.status(500).json({ success: false, message: "Internal server error" });
};
