const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { getCourses, getCourse, addCourse, editCourse, deleteCourse } = require("../controllers/courses");

// Public routes
router.route("/").get(getCourses);
router.route("/:id").get(getCourse);

// Admin-only routes
router.route("/add").post(protect, authorize("admin"), addCourse);
router.route("/edit/:id").put(protect, authorize("admin"), editCourse);
router.route("/delete/:id").delete(protect, authorize("admin"), deleteCourse);

module.exports = router;
