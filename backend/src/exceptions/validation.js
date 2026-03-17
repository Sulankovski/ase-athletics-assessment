export class ValidationError extends Error {
  constructor(detail) {
    super(detail);
    this.statusCode = 400;
    this.detail = detail;
  }
}
