const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("Course route is requesting ...");
  next();
});

// 取得所有課程
router.get("/", async (req, res) => {
  try {
    let foundCourses = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();

    return res.send(foundCourses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 取得指定 id 課程
router.get("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let foundCourse = await Course.findOne({ _id }).exec();
    return res.send(foundCourse);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 用 course title 取得課程
router.get("/findByTitle/:title", async (req, res) => {
  try {
    let { title } = req.params;
    let foundCourses = await Course.find({ title: { $regex: title } })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(foundCourses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 使用 student id 取得課程
router.get("/student/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let foundCourses = await Course.find({ students: _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(foundCourses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 使用 instructor id 取得課程
router.get("/instructor/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let foundCourses = await Course.find({ instructor: _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(foundCourses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 新增課程
router.post("/", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  if (req.user.isStudent()) {
    return res
      .status(400)
      .send(
        "Only instructor can release new courses, please login with instructor account."
      );
  }

  let { title, description, price } = req.body;
  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user.id,
  });
  try {
    let savedCourse = await newCourse.save();
    return res.send({ msg: "New course is saved.", savedCourse });
  } catch (error) {
    return res.status(500).send("Create course failed.");
  }
});

// 讓學生透過 course id 來註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  if (req.user.isInstructor()) {
    return res
      .status(400)
      .send(
        "Only student can enroll new courses, please login with student account."
      );
  }
  let { _id } = req.params;

  try {
    let foundCourse = await Course.findOne({ _id }).exec();
    if (foundCourse.students.includes(req.user._id)) {
      return res.status(400).send("You are already enrolled this course!!");
    }
    foundCourse.students.push(req.user._id);
    await foundCourse.save();
    return res.send("Enroll success.");
  } catch (error) {
    return res.status(500).send("Create course failed.");
  }
});

// 更新指定 id 課程
router.patch("/:_id", async (req, res) => {
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認課程存在
  let { _id } = req.params;
  try {
    let foundCourse = await Course.findOne({ _id }).exec();
    if (!foundCourse) {
      return res.status(400).send("Cannot find course. Update failed.");
    }

    if (foundCourse.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({ msg: "Course update success.", updatedCourse });
    } else {
      return res.status(403).send("You are not allowed to update this course.");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 刪除指定 id 課程
router.delete("/:_id", async (req, res) => {
  // 確認課程存在
  let { _id } = req.params;
  try {
    let foundCourse = await Course.findOne({ _id }).exec();
    if (!foundCourse) {
      return res.status(400).send("Cannot find course. Update failed.");
    }

    if (foundCourse.instructor.equals(req.user._id)) {
      let deletedResult = await Course.deleteOne({ _id }).exec();
      return res.send({ msg: "Course delete success.", deletedResult });
    } else {
      return res.status(403).send("You are not allowed to update this course.");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
