export type AuthRole = "guest" | "user" | "admin";

export interface Course {
  _id: string;
  title: string;
  description: string;
  content: string[];
  price: number;
  imageUrl: string;
  creatorId: string;
}

export interface Purchase {
  _id: string;
  userId: string;
  courseId: string;
}

export interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SigninBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface CoursePayload {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
}

export interface UpdateCoursePayload extends CoursePayload {
  courseId: string;
}
