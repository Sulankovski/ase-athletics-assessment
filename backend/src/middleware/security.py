from fastapi.security import HTTPBearer, OAuth2PasswordBearer

# OAuth2: Swagger shows username/password, auto-fetches token from /auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# Bearer: Swagger shows a single field to paste your token directly
bearer_scheme = HTTPBearer(auto_error=False)
