/**
 * Lightweight email pattern used for client-side auth validation.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Maps API error payloads to localized UI messages.
 */
export function messageForAuthError(error, t) {
  if (!error?.code) return error?.message || t.errorGeneric;
  switch (error.code) {
    case "user/email_exists":
      return t.authErrorEmailExists;
    case "user/username_exists":
      return t.authErrorUsernameExists;
    case "auth/incorrect_email_or_password":
      return t.authErrorInvalidCredentials;
    case "auth/not_authenticated":
      return t.authErrorNotAuthenticated;
    case "auth/token_expired":
      return t.authErrorTokenExpired;
    default:
      return error.message || t.errorGeneric;
  }
}
