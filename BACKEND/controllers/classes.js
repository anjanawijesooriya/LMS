const Class = require("../models/classes");
const User = require("../models/auth");
const sendEmail = require("../utils/sendEmail");

exports.addClass = async (req, res) => {
  try {
    const { className, classLink, description, classDate, classTime, classGrade, notes } = req.body;

    const isAvailable = await Class.findOne({
      className: { $regex: new RegExp(`^${className}$`, "i") },
    });

    if (isAvailable) {
      return res.status(400).json({ error: "Class name already exists. Please use a different name." });
    }

    const newClass = new Class({
      className,
      classLink,
      description,
      classDate: new Date(classDate),
      classTime,
      classGrade,
      notes: notes || "",
    });

    const savedClass = await newClass.save();
    return res.status(201).json({ success: true, data: savedClass });
  } catch (error) {
    console.error("Error adding class:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ classDate: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.editClass = async (req, res) => {
  const { id } = req.params;
  const { className, classLink, description, classDate, classTime, classGrade, notes } = req.body;

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { className, classLink, description, classDate, classTime, classGrade, notes: notes || "" },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.json({ success: true, updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await Class.findByIdAndDelete(id);
    res.json({ success: true, message: "Successfully deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel a class and notify students of the affected grade
exports.cancelClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    if (cls.isCancelled) {
      return res.status(400).json({ success: false, message: "Class is already cancelled" });
    }

    cls.isCancelled = true;
    cls.cancellationReason = cancellationReason || "";
    await cls.save();

    // Notify all active students of the same grade
    const students = await User.find({ role: "student", grade: cls.classGrade });

    const emailPromises = students.map((student) => {
      const classDateStr = new Date(cls.classDate).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      const message = `
        <h1>Class Cancelled ❌</h1>
        <p>Hello ${student.firstName} ${student.lastName},</p>
        <p>We regret to inform you that the following class has been <strong>cancelled</strong>:</p>
        <ul>
          <li><strong>Class:</strong> ${cls.className}</li>
          <li><strong>Date:</strong> ${classDateStr}</li>
          <li><strong>Time:</strong> ${cls.classTime}</li>
          <li><strong>Grade:</strong> ${cls.classGrade}</li>
        </ul>
        ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ""}
        <p>We apologize for any inconvenience. A rescheduled class will be announced soon.</p>
        <br>
        <strong>Devians LMS Team</strong>
      `;
      return sendEmail({
        to: student.email,
        subject: `Class Cancelled: ${cls.className} - Devians LMS`,
        html: message,
      });
    });

    await Promise.allSettled(emailPromises);

    res.json({ success: true, message: `Class cancelled. ${students.length} student(s) notified.` });
  } catch (error) {
    console.error("Cancel class error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
