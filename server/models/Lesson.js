const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: [
      {
        type: mongoose.Schema.Types.Mixed,
        // Example blocks:
        // { type: 'heading', value: '...' }
        // { type: 'paragraph', value: '...' }
        // { type: 'code', language: 'javascript', value: '...' }
        // { type: 'video', url: '...' }
        // { type: 'mcq', question: '...', options: ['...'], correctIndex: 0 }
      },
    ],
    isEnriched: {
      type: Boolean,
      default: false,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
