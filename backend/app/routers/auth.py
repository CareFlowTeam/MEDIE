# auth.py


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        nickname=data.nickname,
        login_type="local",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "login_type": user.login_type,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    if user.login_type != "local":
        raise HTTPException(
            status_code=400,
            detail="일반 로그인이 아닌 계정입니다. 소셜 로그인을 이용해주세요.",
        )

    if not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "login_type": user.login_type,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
