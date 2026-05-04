import API from './axios';

export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

export const getCourses = () => API.get('/courses');
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const generateCourse = (data) => API.post('/courses/generate-course', data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

export const generateLesson = (lessonId) => API.post(`/lessons/generate-lesson/${lessonId}`);
