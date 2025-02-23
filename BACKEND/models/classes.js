const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  className: {
    type: String,
    required: [true, "Please enter the class name"],
    unique: true,
  },

  classLink: {
    type: String,
    required: [true, "Please enter the class link"],
    unique: true,
  },

  description: {
    type: String,
    required: [true, "Please enter the class description"],
  },

  classDate: {
    type: Date,
    required: [true, "Please enter the class date"],
  },

  classGrade: {
    type: String,
    required: [true, "Please enter grade"],
  },

  classTime: {
    type: String, // Storing time as a string in "HH:mm" format
    required: [true, "Please enter the class time"],
  },
});

module.exports = mongoose.model("Class", ClassSchema);
