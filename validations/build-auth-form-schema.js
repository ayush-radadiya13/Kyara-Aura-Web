import { z } from "zod";
import {
  AUTH_FIELD_META,
  INDIAN_PHONE_PATTERN,
} from "@/lib/auth/fields";

/**
 * Build a Zod schema for dynamic auth forms based on configured field keys.
 * @param {string[]} fieldKeys
 */
export function buildAuthFormSchema(fieldKeys) {
  /** @type {Record<string, z.ZodTypeAny>} */
  const shape = {};

  for (const key of fieldKeys) {
    const label = AUTH_FIELD_META[key]?.label ?? key;

    if (key === "email") {
      shape[key] = z.string().email("Enter a valid email address");
      continue;
    }

    if (key === "phone") {
      shape[key] = z
        .string()
        .regex(INDIAN_PHONE_PATTERN, "Enter a valid 10-digit Indian mobile number");
      continue;
    }

    if (key === "password") {
      shape[key] = z.string().min(8, "Password must be at least 8 characters");
      continue;
    }

    if (key === "password_confirmation") {
      shape[key] = z.string().min(1, `${label} is required`);
      continue;
    }

    shape[key] = z.string().min(1, `${label} is required`);
  }

  let schema = z.object(shape);

  if (
    fieldKeys.includes("password") &&
    fieldKeys.includes("password_confirmation")
  ) {
    schema = schema.refine(
      (data) => data.password === data.password_confirmation,
      {
        message: "Passwords do not match",
        path: ["password_confirmation"],
      }
    );
  }

  return schema;
}

/**
 * @param {unknown} schema
 * @param {Record<string, string>} values
 * @returns {{ success: true; data: Record<string, string> } | { success: false; errors: Record<string, string> }}
 */
export function validateAuthForm(schema, values) {
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data };
  }

  /** @type {Record<string, string>} */
  const errors = {};

  for (const issue of result.error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
