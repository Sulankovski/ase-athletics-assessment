export class ReportNotFoundError extends Error {
  constructor(detail = "Report not found") {
    super(detail);
    this.statusCode = 404;
    this.detail = detail;
  }
}
