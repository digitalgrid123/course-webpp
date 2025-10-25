import { apiConnection } from "@/services/apiConnection";
import {
  DashboardHomeResponse,
  CourseDetailResponse,
  CourseDetailRequest,
  LessonProgressRequest,
  LessonProgressResponse,
  BuyCourseRequest,
  BuyCourseResponse,
} from "@/types";

export const getDashboardHomeApi = () => {
  return apiConnection.auth
    .post("/home")
    .then((response) => response as unknown as DashboardHomeResponse);
};

export const getCourseDetailApi = (data: CourseDetailRequest) => {
  return apiConnection.auth
    .post("/courses-details", data)
    .then((response) => response as unknown as CourseDetailResponse);
};

export const updateLessonProgressApi = (data: LessonProgressRequest) => {
  return apiConnection.auth
    .post("/update-lesson-progress", data)
    .then((response) => response as unknown as LessonProgressResponse);
};

export const buyCourseApi = (data: BuyCourseRequest) => {
  return apiConnection.auth
    .post("/buyCourse", data)
    .then((response) => response as unknown as BuyCourseResponse);
};

export const getMyCoursesApi = () => {
  return apiConnection.auth
    .post("/my-courses")
    .then((response) => response as unknown as DashboardHomeResponse);
};
