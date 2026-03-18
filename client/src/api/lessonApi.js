import API from "./axiosInstance";

export const getLessonById = (lessonId) => API.get(`/lessons/${lessonId}`);
export const markLessonComplete = (lessonId) => API.patch(`/lessons/${lessonId}/complete`);
