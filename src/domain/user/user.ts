export class User {
  // id: string;
  username: string;
  firstName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    username: string,
    firstName: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.username = username;
    this.firstName = firstName;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
