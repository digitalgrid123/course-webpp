export interface CustomAxiosResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
}

// Login Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginUser {
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

// Registration Types
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

// OTP Types
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

// Degree and Year Types
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

// Course related types
export interface Teacher {
  id: number;
  name: string;
  bio: string;
  image: string;
  detail: string;
  courses_count: number;
}

// Material types
export interface Material {
  id: number;
  lesson_id: number;
  file_type: number; // 1 = PDF, 2 = Link, 3 = Document
  file: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  type: number; // 1 = regular, 2 = video
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
