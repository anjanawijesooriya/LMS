const Class = require("../models/classes");

exports.addClass = async (req, res) => {
  try {
    const { className, classLink, description, classDate, classTime, classGrade } =
      req.body;

    const isAvailable = await Class.findOne({
      className: { $regex: new RegExp(className, "i") },
    });

    if (isAvailable) {
      return res
        .status(401)
        .json({ error: "Classname already added, Please add a new name" });
    }

    const newClass = new Class({
      className,
      classLink,
      description,
      classDate: new Date(classDate),
      classTime,
      classGrade,
    });

    const savedClass = await newClass.save();
    return res.status(201).json({ success: true, data: savedClass });
  } catch (error) {
    console.error("Error adding class:", error); // Log error for debugging
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClasses = async (req, res) => {
  await Class.find()
    .then((classes) => res.json(classes))
    .catch((error) => res.status(500).json({ success: false, error: error }));
};

exports.getClass = async (req, res) => {
  const { id } = req.params;

  await Class.findById(id)
    .then((classes) => res.json(classes))
    .catch((error) => res.status(500).json({ success: false, error: error }));
};

exports.editClass = async (req, res) => {
  const { id } = req.params;

  const { className, classLink, description, classDate, classTime, classGrade } = req.body;

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { className, classLink, description, classDate, classTime, classGrade },
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    res.json({ success: true, updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  const { id } = req.params;

  await Class.findByIdAndDelete(id)
    .then(() => res.json({ success: true, message: "Successfully deleted" }))
    .catch((error) => res.status(500).json({ success: false, error: error }));
};
