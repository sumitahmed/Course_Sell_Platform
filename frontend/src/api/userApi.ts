import { apiRequest } from "./client";
import type {
  AuthResponse,
  Purchase,
  SigninBody,
  SignupBody,
  Course
} from "../types";

interface SignupResponse {
  message: string;
}

interface PurchasesResponse {
  purchases: Purchase[];
  coursesData: Course[];
}

export function userSignup(body: SignupBody) {
  return apiRequest<SignupResponse>("/user/signup", {
    method: "POST",
    body
  });
}

export function userSignin(body: SigninBody) {
  return apiRequest<AuthResponse>("/user/signin", {
    method: "POST",
    body
  });
}

export function getUserPurchases(token: string | null) {
  return apiRequest<PurchasesResponse>("/user/purchases", {
    token
  });
}
