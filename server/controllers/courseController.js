const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { generateCourse: generateCourseAI } = require("../services/geminiService");

const generateCourse = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    const courseData = await generateCourseAI(topic);
    
    // Support Auth0 sub or standard req.user.id depending on what's available
    const creator = req.auth?.payload?.sub || req.user?.id;
    if (!creator) {
        return res.status(401).json({ success: false, message: "Unauthorized: No creator ID" });
    }

    const course = await Course.create({
      title: courseData.title,
      description: courseData.description,
      tags: courseData.tags || [],
      creator,
    });

    const moduleDocs = [];
    for (const modData of courseData.modules) {
      const moduleDoc = await Module.create({
        title: modData.title,
        course: course._id,
      });

      const lessonIds = [];
      if (modData.lessons) {
        for (const lesData of modData.lessons) {
          const lessonDoc = await Lesson.create({
            title: lesData.title,
            module: moduleDoc._id,
            content: [],
            isEnriched: false,
          });
          lessonIds.push(lessonDoc._id);
        }
      }

      moduleDoc.lessons = lessonIds;
      await moduleDoc.save();
      moduleDocs.push(moduleDoc._id);
    }

    course.modules = moduleDocs;
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
    const creator = req.auth?.payload?.sub || req.user?.id;
    const courses = await Course.find({ creator })
      .populate({
        path: "modules",
        populate: { path: "lessons" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const creator = req.auth?.payload?.sub || req.user?.id;
    const course = await Course.findOne({ _id: req.params.id, creator }).populate({
      path: "modules",
      populate: { path: "lessons" },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCourse,
  getUserCourses,
  getCourseById,
};
