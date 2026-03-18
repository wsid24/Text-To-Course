import API from "./axiosInstance";

export const generateCourse = (data) => API.post("/courses/generate", data);
export const getCourses = () => API.get("/courses");
export const getCourseById = (courseId) => API.get(`/courses/${courseId}`);
export const deleteCourse = (courseId) => API.delete(`/courses/${courseId}`);
