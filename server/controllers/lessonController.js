const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const Course = require("../models/Course");
const { generateLesson: generateLessonAI } = require("../services/geminiService");

const generateLessonContent = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate("module");
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const parentModule = lesson.module;
    const course = await Course.findById(parentModule.course);

    const creator = req.auth?.payload?.sub || req.user?.id;
    if (course.creator !== creator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const lessonData = await generateLessonAI(course.title, parentModule.title, lesson.title);

    let blocks = [];
    if (Array.isArray(lessonData)) {
      blocks = lessonData;
    } else if (lessonData && lessonData.content) {
      blocks = lessonData.content;
    } else if (lessonData && typeof lessonData === "object") {
      blocks = lessonData.blocks || lessonData.contentBlocks || [lessonData];
    }
    
    if (!Array.isArray(blocks)) {
      if (lessonData.lessonContent && Array.isArray(lessonData.lessonContent)) {
         blocks = lessonData.lessonContent;
      } else {
        blocks = lessonData.blocks || lessonData.items || lessonData.content || [lessonData];
      }
    }

    lesson.content = blocks;
    lesson.isEnriched = true;
    await lesson.save();

    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateLessonContent,
};
