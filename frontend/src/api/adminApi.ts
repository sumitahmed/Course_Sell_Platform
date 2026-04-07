import { apiRequest } from "./client";
import type {
  AuthResponse,
  Course,
  CoursePayload,
  SigninBody,
  SignupBody,
  UpdateCoursePayload
} from "../types";

interface SignupResponse {
  message: string;
}

interface AdminCourseListResponse {
  message: string;
  courses: Course[];
}

interface CreateCourseResponse {
  message: string;
  courseId: string;
}

interface MessageResponse {
  message: string;
}

interface AddContentResponse {
  message: string;
  course: Course;
}

export function adminSignup(body: SignupBody) {
  return apiRequest<SignupResponse>("/admin/signup", {
    method: "POST",
    body
  });
}

export function adminSignin(body: SigninBody) {
  return apiRequest<AuthResponse>("/admin/signin", {
    method: "POST",
    body
  });
}

export function getAdminCourses(token: string | null) {
  return apiRequest<AdminCourseListResponse>("/admin/course/bulk", {
    token
  });
}

export function createAdminCourse(body: CoursePayload, token: string | null) {
  return apiRequest<CreateCourseResponse>("/admin/course", {
    method: "POST",
    body,
    token
  });
}

export function updateAdminCourse(
  body: UpdateCoursePayload,
  token: string | null
) {
  return apiRequest<MessageResponse>("/admin/course", {
    method: "PUT",
    body,
    token
  });
}

export function deleteAdminCourse(courseId: string, token: string | null) {
  return apiRequest<MessageResponse>(`/admin/course/${courseId}`, {
    method: "DELETE",
    token
  });
}

export function addAdminCourseContent(
  courseId: string,
  content: string,
  token: string | null
) {
  return apiRequest<AddContentResponse>(`/admin/course/${courseId}/content`, {
    method: "POST",
    body: { content },
    token
  });
}
