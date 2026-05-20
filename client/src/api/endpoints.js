import API from './axios';
import { getCurrentProvider } from '../context/LLMContext';

// Auth — Auth0 handles login/registration; the API only echoes /me.
export const getMe = () => API.get('/auth/me');

// Courses
export const getCourses = () => API.get('/courses');
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const generateCourse = (data) =>
  API.post('/courses/generate-course', { ...data, provider: getCurrentProvider() });
export const disambiguateTopic = (topic) =>
  API.post('/courses/disambiguate-topic', { topic, provider: getCurrentProvider() });
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// Lessons
export const generateLesson = (lessonId) =>
  API.post(`/lessons/generate-lesson/${lessonId}`, { provider: getCurrentProvider() });
