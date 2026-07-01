import { loginApi } from "@/services/auth/login";
import { registerApi } from "@/services/auth/register";
import { getProfileApi } from "@/services/auth/profile";
import { logoutApi } from "@/services/auth/logout";
import { forgotPasswordApi } from "@/services/auth/forgot-password";
import { resetPasswordApi } from "@/services/auth/reset-password";
import { verifyEmailApi } from "@/services/auth/verify-email";
import { verifyOtpApi } from "@/services/auth/verify-otp";
import { sendOtpApi } from "@/services/auth/send-otp";
import { updateProfileApi } from "@/services/auth/profile";

export const authService = {
  login: loginApi,
  register: registerApi,
  sendOtp: sendOtpApi,
  getProfile: getProfileApi,
  updateProfile: updateProfileApi,
  logout: logoutApi,
  forgotPassword: forgotPasswordApi,
  resetPassword: resetPasswordApi,
  verifyEmail: verifyEmailApi,
  verifyOtp: verifyOtpApi,
};

export async function loginService(payload) {
  return authService.login(payload);
}

export async function registerService(payload) {
  return authService.register(payload);
}
