const router = require("express").Router();

const { getCourses, getCourse, addCourse, editCourse, deleteCourse } = require("../controllers/courses");

router.route("/").get(getCourses);

router.route("/:id").get(getCourse);

router.route("/add").post(addCourse);

router.route("/edit/:id").put(editCourse);

router.route("/delete/:id").delete(deleteCourse);

module.exports = router;