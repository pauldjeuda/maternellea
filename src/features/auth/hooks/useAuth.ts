/**
 * features/auth/hooks/useAuth.ts
 *
 * Custom hook that bridges AuthService (async calls) and
 * useAuthStore (state). Screens only call this hook — they
 * never interact with the service or store directly.
 *
 * Returns:
 *   - state flags (isLoading, error, isAuthenticated, …)
 *   - action functions (signIn, signUp, signOut, forgotPassword)
 *   - current user
 */

import { useState, useCallback } from 'react';
import { useAuthStore, selectAuthActions, selectUser, selectIsAuth, selectIsOnboarded } from '@store/authStore';
import { AuthService } from '../services/authService';
import type { SignInFormValues, SignUpFormValues, AuthError } from '../types';

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

interface UseAuthReturn {
  // State
  user:                  ReturnType<typeof selectUser>;
  isAuthenticated:       boolean;
  isOnboardingComplete:  boolean;
  isLoading:             boolean;
  error:                 string | null;

  // Actions
  signIn:         (values: SignInFormValues) => Promise<boolean>;
  signUp:         (values: SignUpFormValues) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  signOut:        () => Promise<void>;
  clearError:     () => void;
}

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const user                 = useAuthStore(selectUser);
  const isAuthenticated      = useAuthStore(selectIsAuth);
  const isOnboardingComplete = useAuthStore(selectIsOnboarded);
  const { setUser, setTokens, logout } = useAuthStore(selectAuthActions);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Sign In ────────────────────────────────────────────────

  const signIn = useCallback(async (values: SignInFormValues): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: authUser, tokens } = await AuthService.signIn(values.email, values.password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(authUser);
      return true;
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message ?? 'Une erreur est survenue. Réessayez.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setTokens]);

  // ── Sign Up ────────────────────────────────────────────────

  const signUp = useCallback(async (values: SignUpFormValues): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: authUser, tokens } = await AuthService.signUp(
        values.firstName,
        values.email,
        values.password,
      );
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(authUser);
      return true;
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message ?? 'Impossible de créer le compte. Réessayez.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setTokens]);

  // ── Forgot Password ────────────────────────────────────────

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.forgotPassword(email);
      return true;
    } catch {
      setError("Impossible d'envoyer l'email. Réessayez dans quelques instants.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sign Out ───────────────────────────────────────────────

  const signOut = useCallback(async (): Promise<void> => {
    const token = useAuthStore.getState().token;
    try {
      if (token) await AuthService.signOut(token);
    } catch {
      // always log out locally even if server call fails
    } finally {
      logout();
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    error,
    signIn,
    signUp,
    forgotPassword,
    signOut,
    clearError,
  };
}
