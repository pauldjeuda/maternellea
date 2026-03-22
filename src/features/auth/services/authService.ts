/**
 * features/auth/services/authService.ts
 *
 * Mock authentication service.
 * Mirrors the contract a real REST/GraphQL backend would expose.
 * Replace the internals with real API calls without changing call sites.
 *
 * Behaviour:
 *  - signIn:   accepts any @test.com email | fixed demo account | rejects unknown
 *  - signUp:   creates user in memory, rejects duplicate email
 *  - signOut:  clears tokens
 *  - password: always succeeds (email sent simulation)
 */

import { UserProfile } from '@types/models';
import {
  SignInResponse, SignUpResponse,
  AuthTokens, AuthError,
} from '../types';

// ─────────────────────────────────────────────────────────────
//  MOCK DATABASE  (in-memory, reset on app restart)
// ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNT = {
  email:    'demo@maternellea.com',
  password: 'Demo1234',
};

// Tracks registered accounts for sign-up duplicate check
const registeredEmails = new Set<string>([DEMO_ACCOUNT.email]);

// Mock user registry (email → profile)
const userRegistry = new Map<string, UserProfile>();

// ─────────────────────────────────────────────────────────────
//  TOKEN FACTORY
// ─────────────────────────────────────────────────────────────

function generateTokens(userId: string): AuthTokens {
  return {
    accessToken:  `mock_access_${userId}_${Date.now()}`,
    refreshToken: `mock_refresh_${userId}_${Date.now()}`,
    expiresIn:    3600,
  };
}

// ─────────────────────────────────────────────────────────────
//  USER FACTORY
// ─────────────────────────────────────────────────────────────

function createUser(firstName: string, email: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id:                        `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    firstName,
    country:                   'FR',
    language:                  'fr',
    activePhase:               'cycle',
    notificationsEnabled:      true,
    cycleReminderEnabled:      true,
    appointmentReminderEnabled: true,
    vaccineReminderEnabled:    true,
    weeklyDigestEnabled:       true,
    createdAt:                 now,
    updatedAt:                 now,
  };
}

// Pre-seed demo user
userRegistry.set(DEMO_ACCOUNT.email, createUser('Camille', DEMO_ACCOUNT.email));

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

/** Simulate network latency */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build a typed auth error */
function authError(code: AuthError['code'], message: string): AuthError {
  return { code, message };
}

// ─────────────────────────────────────────────────────────────
//  SERVICE
// ─────────────────────────────────────────────────────────────

export const AuthService = {
  /**
   * signIn
   * Accepts:
   *  - demo@maternellea.com / Demo1234
   *  - any *@test.com with any password
   *  - any user registered via signUp in the same session
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    await delay(900 + Math.random() * 400);

    const normalised = email.toLowerCase().trim();

    // Demo account check
    if (normalised === DEMO_ACCOUNT.email) {
      if (password !== DEMO_ACCOUNT.password) {
        throw authError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
      }
      const user   = userRegistry.get(normalised)!;
      const tokens = generateTokens(user.id);
      return { user, tokens };
    }

    // Test wildcard — any @test.com address auto-succeeds
    if (normalised.endsWith('@test.com')) {
      const firstName = normalised.split('@')[0]!;
      let user = userRegistry.get(normalised);
      if (!user) {
        user = createUser(firstName.charAt(0).toUpperCase() + firstName.slice(1), normalised);
        userRegistry.set(normalised, user);
      }
      return { user, tokens: generateTokens(user.id) };
    }

    // Registered user check
    const registeredUser = userRegistry.get(normalised);
    if (!registeredUser) {
      throw authError('USER_NOT_FOUND', "Aucun compte trouvé avec cet email.");
    }

    // For mock purposes we don't store passwords — accept any non-empty password
    if (!password || password.length < 1) {
      throw authError('INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
    }

    return { user: registeredUser, tokens: generateTokens(registeredUser.id) };
  },

  /**
   * signUp
   * Creates a new user. Rejects duplicate emails.
   */
  async signUp(firstName: string, email: string, _password: string): Promise<SignUpResponse> {
    await delay(1100 + Math.random() * 400);

    const normalised = email.toLowerCase().trim();

    if (registeredEmails.has(normalised)) {
      throw authError(
        'EMAIL_ALREADY_EXISTS',
        'Un compte existe déjà avec cet email. Essayez de vous connecter.',
      );
    }

    const user = createUser(firstName.trim(), normalised);
    registeredEmails.add(normalised);
    userRegistry.set(normalised, user);

    const tokens = generateTokens(user.id);
    return { user, tokens };
  },

  /**
   * forgotPassword
   * Always resolves (simulates email dispatch).
   */
  async forgotPassword(email: string): Promise<void> {
    await delay(800 + Math.random() * 300);
    // In real implementation: POST /auth/forgot-password
    console.log(`[AuthService] Password reset email sent to ${email}`);
  },

  /**
   * signOut
   * Clears server-side session (mock: no-op).
   */
  async signOut(_token: string): Promise<void> {
    await delay(200);
    // In real implementation: POST /auth/sign-out with token
  },

  /**
   * refreshAccessToken
   * Returns a new access token given a valid refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<Pick<AuthTokens, 'accessToken' | 'expiresIn'>> {
    await delay(300);
    if (!refreshToken.startsWith('mock_refresh_')) {
      throw authError('INVALID_CREDENTIALS', 'Session expirée. Veuillez vous reconnecter.');
    }
    const userId = refreshToken.replace('mock_refresh_', '').split('_')[0] ?? 'unknown';
    return {
      accessToken: `mock_access_${userId}_${Date.now()}`,
      expiresIn:   3600,
    };
  },

  // ── Demo helpers ────────────────────────────────────────────

  getDemoCredentials() {
    return { ...DEMO_ACCOUNT };
  },
} as const;
