export class PlayerNotFoundError extends Error {
  constructor(detail = "Player not found") {
    super(detail);
    this.statusCode = 404;
    this.detail = detail;
  }
}
