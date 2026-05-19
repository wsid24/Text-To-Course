const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const LessonPipeline = require("../services/pipeline/LessonPipeline");

const generateLessonContent = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate("module");
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const parentModule = lesson.module;
    const course = await Course.findById(parentModule.course);

    if (course.creator.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const lessonData = await LessonPipeline.run({
      courseTitle: course.title,
      moduleTitle: parentModule.title,
      lessonTitle: lesson.title,
      provider: req.body?.provider,
    });

    lesson.content = lessonData.content;
    lesson.isEnriched = true;
    await lesson.save();

    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateLessonContent };
