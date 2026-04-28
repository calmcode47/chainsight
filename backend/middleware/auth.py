from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

# We use a JWK Client to automatically fetch and cache the public keys from Supabase
# This supports ES256 and other asymmetric algorithms
JWKS_URL = os.environ.get("SUPABASE_JWKS_URL")
jwks_client = jwt.PyJWKClient(JWKS_URL) if JWKS_URL else None

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validates Supabase JWT tokens on protected routes using JWKS."""
    token = credentials.credentials
    
    # 0. Special Bypass for Guest Demo Access
    if token == "chainsight-guest-demo":
        return {"sub": "guest-user", "email": "guest@chainsight.demo", "role": "guest"}
    
    try:
        if jwks_client:
            # 1. Fetch the correct signing key from the JWKS endpoint
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            # 2. Decode and verify using the public key
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "HS256"], # Support both just in case
                options={"verify_aud": False} # Relaxed for debugging
            )
            return payload
        else:
            # Fallback to symmetric secret if JWKS is not configured
            payload = jwt.decode(
                token,
                os.environ.get("SUPABASE_JWT_SECRET", ""),
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
            
    except jwt.ExpiredSignatureError:
        print("❌ JWT Error: Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        print(f"❌ JWT Error: Invalid token - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"❌ Auth Exception: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication server error: {str(e)}"
        )

async def require_demo_key(request: Request):
    """Simple API key check for demo control routes."""
    demo_key = request.headers.get("X-Demo-Key")
    expected_key = os.environ.get("DEMO_API_KEY", "chainsight-demo-2026")
    
    if not demo_key or demo_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing Demo API Key"
        )
    return True
