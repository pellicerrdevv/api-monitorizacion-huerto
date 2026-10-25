export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}
