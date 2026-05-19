const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const CoursePipeline = require("../services/pipeline/CoursePipeline");

const generateCourse = async (req, res, next) => {
  try {
    const { topic, provider } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    const courseData = await CoursePipeline.run(topic, { provider });
    const creator = req.user.id;

    const course = await Course.create({
      title: courseData.title,
      description: courseData.description,
      tags: courseData.tags || [],
      creator,
    });

    const moduleIds = [];
    for (const modData of courseData.modules) {
      const moduleDoc = await Module.create({ title: modData.title, course: course._id });
      const lessonIds = [];
      for (const lesData of modData.lessons || []) {
        const lessonDoc = await Lesson.create({
          title: lesData.title,
          module: moduleDoc._id,
          content: [],
          isEnriched: false,
        });
        lessonIds.push(lessonDoc._id);
      }
      moduleDoc.lessons = lessonIds;
      await moduleDoc.save();
      moduleIds.push(moduleDoc._id);
    }

    course.modules = moduleIds;
    await course.save();

    const populatedCourse = await Course.findById(course._id).populate({
      path: "modules",
      populate: { path: "lessons" },
    });

    res.status(201).json({ success: true, course: populatedCourse });
  } catch (error) {
    next(error);
  }
};

const getUserCourses = async (req, res, next) => {
  try {
    const creator = req.user.id;
    const courses = await Course.find({ creator })
      .populate({ path: "modules", populate: { path: "lessons" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const creator = req.user.id;
    const course = await Course.findOne({ _id: req.params.id, creator }).populate({
      path: "modules",
      populate: { path: "lessons" },
    });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const creator = req.user.id;
    const course = await Course.findOne({ _id: req.params.id, creator });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const modules = await Module.find({ course: course._id });
    const moduleIds = modules.map((m) => m._id);
    await Lesson.deleteMany({ module: { $in: moduleIds } });
    await Module.deleteMany({ course: course._id });
    await Course.deleteOne({ _id: course._id });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateCourse, getUserCourses, getCourseById, deleteCourse };
