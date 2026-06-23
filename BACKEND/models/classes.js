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
    match: [/^https?:\/\/.+/, "Please enter a valid URL starting with http:// or https://"],
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
    type: String,
    required: [true, "Please enter the class time"],
  },

  notes: {
    type: String,
    default: "",
  },

  isCancelled: {
    type: Boolean,
    default: false,
  },

  cancellationReason: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("Class", ClassSchema);
