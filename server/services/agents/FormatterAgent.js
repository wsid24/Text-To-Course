const { YOUTUBE_API_KEY } = require("../../config/env");

/**
 * Stage 4 — turns a validated payload into the exact shape the DB layer
 * expects. The single side-effect here is YouTube enrichment for {type:
 * "video"} blocks, parallelised and best-effort (no Gemini cost).
 */
class FormatterAgent {
  formatCourse(validated) {
    return {
      title: validated.title.trim(),
      description: validated.description.trim(),
      tags: validated.tags,
      modules: validated.modules.map((m) => ({
        title: m.title.trim(),
        lessons: m.lessons.map((l) => ({ title: l.title.trim() })),
      })),
    };
  }

  async formatLesson(validated) {
    const blocks = validated.content;

    if (YOUTUBE_API_KEY) {
      const videoBlocks = blocks.filter((b) => b.type === "video" && b.query);
      await Promise.all(
        videoBlocks.map(async (block) => {
          try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(block.query)}&key=${YOUTUBE_API_KEY}&type=video`;
            const ytRes = await fetch(url);
            const ytData = await ytRes.json();
            if (ytData.items && ytData.items.length > 0) {
              block.videoId = ytData.items[0].id.videoId;
              block.url = `https://www.youtube.com/watch?v=${block.videoId}`;
            }
          } catch (err) {
            console.warn("YouTube enrich failed:", err.message);
          }
        })
      );
    }

    return {
      title: validated.title,
      objectives: validated.objectives,
      content: blocks,
    };
  }
}

module.exports = new FormatterAgent();
