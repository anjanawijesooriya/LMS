const Course = require('../models/courses');

// 🔹 **Get All Courses**
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Get Course**
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    res.json(course);
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Add Course**
exports.addCourse = async (req, res) => {
  const { courseName, description, instructor, courseImage } = req.body;

  try {
    if (!courseName || !description || !instructor || !courseImage)
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });

    const course = await Course.create({
      courseName,
      description,
      instructor,
      courseImage,
    });

    res.json({ success: true, course });
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Edit Course**
exports.editCourse = async (req, res) => {
  const { courseName, description, instructor, courseImage } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { courseName, description, instructor, courseImage },
      { new: true }
    );

    if (!updatedCourse)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    res.json({ success: true, updatedCourse });
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Delete Course**
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Error Handler**
const handleError = (error, res) => {
  res.status(500).json({ success: false, message: error.message });
};

