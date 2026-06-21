import { z } from "zod";
import { INDIAN_PHONE_PATTERN } from "@/lib/auth/fields";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select your gender" }),
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .regex(INDIAN_PHONE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .regex(INDIAN_PHONE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
});

export const resetPasswordSchema = z
  .object({
    phone: z
      .string()
      .regex(INDIAN_PHONE_PATTERN, "Enter a valid 10-digit Indian mobile number"),
    otp: z.string().min(1, "OTP is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: z.string().email("Enter a valid email").optional(),
});
