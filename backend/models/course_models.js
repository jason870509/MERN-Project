const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    type: Number,
    required: true,
  },
  // Primary key
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  students: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);