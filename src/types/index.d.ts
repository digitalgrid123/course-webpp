export interface CustomAxiosResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginUser extends User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string;
  status: number;
  is_onboarded: number;
}

export interface LoginData {
  user: LoginUser;
  token: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginData | null;
  errors: Record<string, string[]> | null;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

export interface RegisterUser {
  id: number;
  type: string;
  auth_type: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  phone: string | null;
  dob: string | null;
  gender: number;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  status: number;
  is_onboarded: number;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  user: RegisterUser;
  token: string;
}

export interface RegisterResponse {
  status: boolean;
  message: string;
  data: RegisterData | null;
  errors: Record<string, string[]> | null;
}

export interface SendOtpCredentials {
  email: string;
}

export interface VerifyOtpCredentials {
  email: string;
  otp: string;
}

export interface SendOtpResponse {
  status: boolean;
  message: string;
  data: null;
  errors?: Record<string, string[]>;
}

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  data: LoginData | null;
  errors?: Record<string, string[]>;
}

export interface YearPivot {
  degree_id: number;
  year_id: number;
}

export interface Year {
  id: number;
  name: string;
  image: string;
  pivot?: YearPivot;
}

export interface Degree {
  id: number;
  name: string;
  image: string;
  years?: Year[];
}

export interface DegreeYear {
  id: number;
  degree_id: number;
  year: string;
  year_id: number;
  pivot: {
    user_id: number;
    degree_year_id: number;
  };
  degree: Degree;
  year: Year;
  courses: Course[];
}

export interface DegreeYearsResponse {
  status: boolean;
  message: string;
  data: Degree[] | null;
  errors?: Record<string, string[]>;
}

export interface Teacher {
  id: number;
  name: string;
  bio: string;
  image: string;
  detail: string;
  courses_count: number;
  courses?: Course[];
}

export interface Course {
  id: number;
  name: string;
  image: string;
  price: string;
  modules_count: number;
  lessons_count: number;
  students_count?: number;
}

export interface Material {
  id: number;
  lesson_id: number;
  file_type: number;
  file: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  type: number;
  name: string;
  video: string | null;
  thumbnail: string | null;
  link: string | null;
  schedule_datetime: string | null;
  details: string;
  sorting_order: number;
  created_at: string;
  updated_at: string;
  watched_progress: number;
  materials: Material[];
}

export interface Module {
  id: number;
  course_id: number;
  name: string;
  details: string;
  sorting_order: number;
  module_watched_percentage: number;
  lessons: Lesson[];
}

export interface Pivot {
  degree_year_id: number;
  course_id: number;
}

export interface Course {
  id: number;
  course_point: number;
  name: string;
  image: string;
  teacher_id: number;
  details: string;
  price: string;
  price_type: string;
  modules_count: number;
  lessons_count: number;
  students_count: number;
  is_my_course: number;
  course_watched_percentage: number;
  pivot?: Pivot;
  teacher: Teacher;
  modules: Module[];
}

export interface UserProfile {
  id: number;
  type: string;
  auth_type: string;
  profile_image: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: number;
  email: string;
  phone: string | null;
  status: number;
  is_onboarded: number;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
  my_courses: Course[];
  degree_years: DegreeYear[];
}

export interface DashboardHomeResponse {
  status: boolean;
  message: string;
  data: UserProfile;
  errors: Record<string, string[]> | null;
}

// Course Detail types
export interface CourseDetailData {
  id: number;
  course_point: number;
  name: string;
  image: string;
  teacher_id: number;
  details: string;
  price: string;
  price_type: string;
  modules_count: number;
  lessons_count: number;
  students_count: number;
  is_my_course: number;
  course_watched_percentage: number;
  teacher: Teacher;
  modules: Module[];
}

export interface CourseDetailResponse {
  status: boolean;
  message: string;
  data: CourseDetailData;
  errors: Record<string, string[]> | null;
}

export interface CourseDetailRequest {
  course_id: number;
}

export interface LessonProgressRequest {
  lesson_id: number;
  progress: number;
}

export interface LessonProgressData {
  id: number;
  module_id: number;
  type: number;
  name: string;
  video: string | null;
  thumbnail: string | null;
  link: string | null;
  schedule_datetime: string | null;
  details: string;
  sorting_order: number;
  created_at: string;
  updated_at: string;
  watched_progress: number;
}

export interface LessonProgressResponse {
  status: boolean;
  message: string;
  data?: LessonProgressData;
  errors?: Record<string, string[]> | null;
}

export interface BuyCourseRequest {
  course_ids: number[];
  price: number;
  coupon_id?: number;
}

export interface BuyCourseResponse {
  status: boolean;
  message: string;
  data: {
    added_courses: number[];
    skipped_courses: number[];
  };
  errors: null | string[];
}

export interface FilterCoursesResponse {
  status: boolean;
  message: string;
  data: Course[];
  errors: Record<string, string[]> | null;
}

export interface CouponValidationRequest {
  coupon: string;
  price: number;
}

export interface CouponValidationData {
  new_price: number;
  discount: number;
  coupon_id?: number;
}

export interface CouponValidationResponse {
  status: boolean;
  message: string;
  data: CouponValidationData | null;
  errors: string[] | null;
}

interface BuyCourseRequest {
  course_ids: number[];
  price: number;
  discount_price: number;
  coupon_code?: string;
}

export interface TeachersListResponse extends CustomAxiosResponse<Teacher[]> {
  status: boolean;
  message: string;
  data: Teacher[];
  errors?: Record<string, string[]>;
}

// Teacher Detail Types
export interface TeacherDetail extends Teacher {
  courses: Course[];
}

export interface TeacherDetailResponse
  extends CustomAxiosResponse<TeacherDetail> {
  status: boolean;
  message: string;
  data: TeacherDetail;
  errors?: Record<string, string[]>;
}

export interface CourseModule {
  id: number;
  name: string;
  sorting_order: number;
  lessons: Lesson[];
}

export interface CourseDetail {
  id: number;
  name: string;
  price: string;
  price_type: string;
  image: string;
  details: string;
  is_my_course: number;
  modules_count: number;
  teacher: Teacher;
  modules: CourseModule[];
}

export interface VideoData {
  url: string | null;
  videoId: string | null;
  isYouTube: boolean;
  thumbnail: string | null;
  lessonName: string | null;
  lessonType: number | null;
  meetingLink: string | null;
  scheduleDateTime: string | null;
  details: string | null;
}

export interface LessonMaterial {
  id: number;
  title: string;
  file_type: number;
  file: string;
}

// Profile Types - Add these to your existing types/index.ts file

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  profile_image?: string;
  old_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface User {
  id: number;
  type: string;
  auth_type: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string;
  status: number;
  is_onboarded: number;
  phone: string | null;
  dob: string | null;
  gender: number;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileResponse {
  status: boolean;
  message: string;
  data: {
    user: User;
  };
  errors: Record<string, string[]> | null;
}

// Add to your types file
export interface ResetPasswordCredentials {
  password: string;
  password_confirmation: string;
  token?: string;
}

export interface ResetPasswordResponseData {
  user?: User;
  token?: string;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
  data?: ResetPasswordResponseData;
  errors?: Record<string, string[]> | null;
}
