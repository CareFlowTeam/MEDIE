import requests
from fastapi import APIRouter, HTTPException
from app.schemas.kakao_auth import KakaoLoginRequest
from app.core.security import (
    create_access_token,
)  # 네 프로젝트 실제 경로에 맞게 수정

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/kakao/login")
def kakao_login(data: KakaoLoginRequest):
    headers = {"Authorization": f"Bearer {data.access_token}"}

    user_res = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers=headers,
        timeout=10,
    )

    print("user/me status =", user_res.status_code)
    print("user/me body =", user_res.text)

    if user_res.status_code != 200:
        raise HTTPException(
            status_code=401, detail="카카오 사용자 정보를 확인할 수 없습니다."
        )

    kakao_user = user_res.json()
    kakao_account = kakao_user.get("kakao_account", {})
    properties = kakao_user.get("properties", {})

    response_user = {
        "id": str(kakao_user.get("id")),
        "email": kakao_account.get("email", ""),
        "nickname": properties.get("nickname", "사용자"),
        "login_type": "kakao",
    }

    # 여기서 서버 JWT 발급
    access_token = create_access_token(
        {
            "sub": response_user["id"],
            "email": response_user["email"],
            "nickname": response_user["nickname"],
            "login_type": response_user["login_type"],
        }
    )

    print("최종 반환 user =", response_user)
    print("발급된 JWT =", access_token)

    return {
        "access_token": access_token,
        "user": response_user,
    }
