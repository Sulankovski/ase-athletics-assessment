from fastapi.security import HTTPBearer, OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

bearer_scheme = HTTPBearer(auto_error=False)
