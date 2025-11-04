import { apiConnection } from "@/services/apiConnection";
import { TeacherDetailResponse, TeachersListResponse } from "@/types";

// API Functions
export const getTeachersListApi = () => {
  return apiConnection.auth
    .post("/all-teachers")
    .then((response) => response as unknown as TeachersListResponse);
};

export const getTeacherDetailApi = (teacherId: number) => {
  return apiConnection.auth
    .post(`/teacher/${teacherId}`)
    .then((response) => response as unknown as TeacherDetailResponse);
};
