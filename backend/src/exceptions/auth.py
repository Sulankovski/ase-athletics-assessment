from fastapi import HTTPException


class TokenInvalidOrExpiredError(HTTPException):
    def __init__(self, detail: str = "Token invalid or expired") -> None:
        super().__init__(status_code=401, detail=detail)


class UserAlreadyExistsError(HTTPException):
    def __init__(self, detail: str = "A user with this email already exists") -> None:
        super().__init__(status_code=400, detail=detail)


class InvalidCredentialsError(HTTPException):
    def __init__(self, detail: str = "Invalid email or password") -> None:
        super().__init__(status_code=401, detail=detail)


class UserNotFoundError(HTTPException):
    def __init__(self, detail: str = "User not found") -> None:
        super().__init__(status_code=404, detail=detail)
