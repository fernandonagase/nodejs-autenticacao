export class User {
  // id: string;
  username: string;
  firstName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    username: string,
    firstName: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.username = username;
    this.firstName = firstName;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
