import { z } from "zod";
import {
  AUTH_FIELD_META,
  INDIAN_PHONE_PATTERN,
} from "@/lib/auth/fields";

/**
 * Build a Zod schema for dynamic auth forms based on configured field keys.
 * @param {string[]} fieldKeys
 */
export function buildAuthFormSchema(fieldKeys, formType = 'register') {
  const isLoginForm = formType === 'login';

  const isEmailOrPhone = (value) => {
    if (typeof value !== 'string') return false;
    if (value === '') return true;
    const isEmail = z.string().email().safeParse(value).success;
    const isPhone = INDIAN_PHONE_PATTERN.test(value);
    return isEmail || isPhone;
  };

  /** @type {Record<string, z.ZodTypeAny>} */
  const shape = {};

  for (const key of fieldKeys) {
    const label = AUTH_FIELD_META[key]?.label ?? key;

    if (key === 'email') {
      if (isLoginForm && fieldKeys.includes('phone')) {
        shape[key] = z
          .string()
          .min(0)
          .refine(
            (value) => isEmailOrPhone(value),
            {
              message: 'Enter a valid email address or mobile number',
            },
          );
      } else if (isLoginForm) {
        shape[key] = z
          .string()
          .min(1, 'Email or mobile number is required')
          .refine(
            (value) => isEmailOrPhone(value),
            {
              message: 'Enter a valid email address or mobile number',
            },
          );
      } else {
        shape[key] = z.string().email('Enter a valid email address');
      }
      continue;
    }

    if (key === 'phone') {
      if (isLoginForm && fieldKeys.includes('email')) {
        shape[key] = z
          .string()
          .min(0)
          .refine(
            (value) => value === '' || INDIAN_PHONE_PATTERN.test(value),
            {
              message: 'Enter a valid 10-digit Indian mobile number',
            },
          );
      } else {
        shape[key] = z
          .string()
          .regex(INDIAN_PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number');
      }
      continue;
    }

    if (key === 'gender') {
      shape[key] = z.enum(['male', 'female'], {
        errorMap: () => ({ message: 'Please select your gender' }),
      });
      continue;
    }

    if (key === 'password') {
      shape[key] = z.string().min(8, 'Password must be at least 8 characters');
      continue;
    }

    if (key === 'password_confirmation') {
      shape[key] = z.string().min(1, `${label} is required`);
      continue;
    }

    shape[key] = z.string().min(1, `${label} is required`);
  }

  let schema = z.object(shape);

  if (isLoginForm && fieldKeys.includes('email') && fieldKeys.includes('phone')) {
    schema = schema.superRefine((data, ctx) => {
      const emailValue = String(data.email ?? '').trim();
      const phoneValue = String(data.phone ?? '').trim();

      if (emailValue === '' && phoneValue === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter your email or mobile number',
          path: ['email'],
        });
      }
    });
  }

  if (
    fieldKeys.includes('password') &&
    fieldKeys.includes('password_confirmation')
  ) {
    schema = schema.refine(
      (data) => data.password === data.password_confirmation,
      {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
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
