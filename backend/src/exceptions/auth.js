export class TokenInvalidOrExpiredError extends Error {
  constructor(detail = "Token invalid or expired") {
    super(detail);
    this.statusCode = 401;
    this.detail = detail;
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(detail = "A user with this email already exists") {
    super(detail);
    this.statusCode = 400;
    this.detail = detail;
  }
}

export class InvalidCredentialsError extends Error {
  constructor(detail = "Invalid email or password") {
    super(detail);
    this.statusCode = 401;
    this.detail = detail;
  }
}

export class UserNotFoundError extends Error {
  constructor(detail = "User not found") {
    super(detail);
    this.statusCode = 404;
    this.detail = detail;
  }
}
