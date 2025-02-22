const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    courseName: {
        type: String,
        required: [true, "Please enter the course name"],
        unique: true,
    },

    description: {
        type: String,
        required: [true, "Please enter the course description"],
    },

    instructor: {
        type: String,
        required: [true, "Please enter the course instructor"],
    },

    courseImage: {
        type: String,
        required: [true, "Please enter the course image"],
    },
});

module.exports = mongoose.model("Course", CourseSchema);