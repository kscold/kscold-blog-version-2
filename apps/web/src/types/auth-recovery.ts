export interface PasswordResetTokenStatus {
  valid: boolean;
  message: string;
  expiresAt: string | null;
}

export interface EmailRecoveryRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
