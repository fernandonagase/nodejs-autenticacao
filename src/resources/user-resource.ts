import { UserWithId } from "../domain/user/user.js";

export interface UserResource {
  id: number;
  username: string;
  firstName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedEmail: boolean;
}

export function userToResource(user: UserWithId): UserResource {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verifiedEmail: user.verifiedEmail,
  };
}
