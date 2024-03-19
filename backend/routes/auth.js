const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("正在接收 auth request...");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結 auth");
});

router.post("/register", async (req, res) => {
  // 確認數據是否符合規範
  let { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認信箱是否已註冊
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("Email is exist");
  } else {
    const { email, username, password, role } = req.body;
    let newUser = new User({
      email,
      username,
      password,
      role,
    });
    try {
      let savedUser = await newUser.save();
      return res.send({ msg: "Saved user success", savedUser });
    } catch (e) {
      return res.status(500).send(`Save user failed with ${e}`);
    }
  }
});

router.post("/login", async (req, res) => {
  // 確認數據是否符合規範
  let { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認信箱是否已註冊
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res
      .status(400)
      .send("User not found. Please check email is correct.");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      // 製作 jwt
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        msg: "Login Success.",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("Password wrong...");
    }
  });
});

module.exports = router;
