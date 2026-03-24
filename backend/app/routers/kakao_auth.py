import requests
from fastapi import APIRouter, HTTPException
from app.schemas.kakao_auth import KakaoLoginRequest

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

    print("최종 반환 user =", response_user)

    return {
        "access_token": "temp-kakao-token",
        "user": response_user,
    }
