const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const Course = require("../models/Course");
const CurriculumAgent = require("../services/CurriculumAgent");
const { YOUTUBE_API_KEY } = require("../config/env");

const generateLessonContent = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate("module");
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const parentModule = lesson.module;
    const course = await Course.findById(parentModule.course);

    const creator = req.user.id;
    if (course.creator.toString() !== creator.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const lessonData = await CurriculumAgent.generateLesson(course.title, parentModule.title, lesson.title);

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

    // Enrich video blocks with actual YouTube video IDs
    for (const block of blocks) {
      if (block.type === 'video' && block.query && YOUTUBE_API_KEY) {
        try {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(block.query)}&key=${YOUTUBE_API_KEY}&type=video`;
          const ytRes = await fetch(url);
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            block.videoId = ytData.items[0].id.videoId;
            block.url = `https://www.youtube.com/watch?v=${block.videoId}`;
          }
        } catch (err) {
          console.error("YouTube search failed:", err.message);
        }
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
