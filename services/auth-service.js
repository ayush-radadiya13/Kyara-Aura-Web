import { loginApi } from "@/services/auth/login";
import { registerApi } from "@/services/auth/register";
import { getProfileApi } from "@/services/auth/profile";
import { logoutApi } from "@/services/auth/logout";
import { forgotPasswordApi } from "@/services/auth/forgot-password";
import { resetPasswordApi } from "@/services/auth/reset-password";
import { verifyEmailApi } from "@/services/auth/verify-email";

export const authService = {
  login: loginApi,
  register: registerApi,
  getProfile: getProfileApi,
  logout: logoutApi,
  forgotPassword: forgotPasswordApi,
  resetPassword: resetPasswordApi,
  verifyEmail: verifyEmailApi,
};

export async function loginService(payload) {
  return authService.login(payload);
}

export async function registerService(payload) {
  return authService.register(payload);
}
