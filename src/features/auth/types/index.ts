/**
 * features/auth/types/index.ts
 *
 * All Zod validation schemas and inferred TypeScript types
 * for the authentication flow. These schemas drive React Hook Form.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

const emailSchema = z
  .string({ required_error: "L'email est requis" })
  .min(1, "L'email est requis")
  .email("Adresse email invalide")
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string({ required_error: 'Le mot de passe est requis' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  );

// ─────────────────────────────────────────────────────────────
//  SIGN IN
// ─────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email:    emailSchema,
  password: z
    .string({ required_error: 'Le mot de passe est requis' })
    .min(1, 'Le mot de passe est requis'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

// ─────────────────────────────────────────────────────────────
//  SIGN UP
// ─────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    firstName: z
      .string({ required_error: 'Le prénom est requis' })
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom est trop long')
      .trim(),
    email:           emailSchema,
    password:        passwordSchema,
    confirmPassword: z.string({ required_error: 'Veuillez confirmer votre mot de passe' }),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Vous devez accepter les conditions d\'utilisation',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path:    ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// ─────────────────────────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─────────────────────────────────────────────────────────────
//  AUTH SERVICE TYPES
// ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number; // seconds
}

export interface SignInResponse {
  user:   import('@types/models').UserProfile;
  tokens: AuthTokens;
}

export interface SignUpResponse {
  user:   import('@types/models').UserProfile;
  tokens: AuthTokens;
}

export interface AuthError {
  code:    AuthErrorCode;
  message: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'WEAK_PASSWORD'
  | 'NETWORK_ERROR'
  | 'TOO_MANY_REQUESTS'
  | 'UNKNOWN';
