import { apiConnection } from "@/services/apiConnection";
import {
  DashboardHomeResponse,
  CourseDetailResponse,
  CourseDetailRequest,
  LessonProgressRequest,
  LessonProgressResponse,
  BuyCourseRequest,
  BuyCourseResponse,
  FilterCoursesResponse,
  CouponValidationResponse,
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

export const filterCoursesApi = (data: {
  keyword?: string;
  degree_id?: number;
  year_id?: number;
}) => {
  return apiConnection.auth
    .post("/filter", data)
    .then((response) => response as unknown as FilterCoursesResponse);
};

// Add to your existing API service file
export const validateCouponApi = (data: { coupon: string; price: number }) => {
  return apiConnection.auth
    .post("/coupon-validation", data)
    .then((response) => response as unknown as CouponValidationResponse);
};
