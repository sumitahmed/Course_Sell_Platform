import { apiRequest } from "./client";
import type { Course } from "../types";

interface CoursePreviewResponse {
  courses: Course[];
}

interface PurchaseBody {
  courseId: string;
}

interface MessageResponse {
  message: string;
}

export function getCoursePreview() {
  return apiRequest<CoursePreviewResponse>("/course/preview");
}

export function purchaseCourse(body: PurchaseBody, token: string | null) {
  return apiRequest<MessageResponse>("/course/purchase", {
    method: "POST",
    body,
    token
  });
}
