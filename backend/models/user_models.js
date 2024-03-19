const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true, minlength: 6, maxlength: 50 },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "instructor"],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// instance methods
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, callbackFn) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return callbackFn(null, result);
  } catch (e) {
    return callbackFn(e, result);
  }
};

// middleware
userSchema.pre("save", async function (next) {
  // this 代表 mongoDB 內的 document，需要用 function declare
  if (this.isNew || this.isModified("password")) {
    let hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
