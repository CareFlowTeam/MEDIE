from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    nickname = Column(String(100), nullable=False)
    kakao_id = Column(String(100), unique=True, nullable=True, index=True)
    login_type = Column(String(20), nullable=False, default="local")  # local / kakao
    created_at = Column(DateTime(timezone=True), server_default=func.now())
