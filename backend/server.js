require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(console.log("Connect to MongoDB"))
  .catch((e) => console.log(e));

app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);
// 應該被 jwt 保護，若 header 內沒有 jwt，reqest 會被 unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log("Backend server listening on port 8080...");
});
